import { UserRepository } from './user.repository'
import { DbErrorCode } from '../shared/db-error-codes.enum';
import { User } from "../auth/user.entity";
import { Test } from "@nestjs/testing";
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

const mockCredentialsDto = { username: 'user1', email: 'email@email.com', password: 'password' }
const mockSignInDto = { email: 'email@email.com', password: '12345678' }

describe('UserRepository', () => {
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserRepository
            ]
        }).compile();

        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('signUp', () => {
        let save;
        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({ save });
        });

        it('should successfully sign up a user', () => {
            save.mockResolvedValue(undefined);
            expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
        });

        it('should throw a conflict exception if email already exists', () => {
            save.mockRejectedValue({ code: DbErrorCode.UNIQUE_COLUMN_VIOLATION })
            expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(ConflictException)
        });

        it('should throw an internal server exception if an error ocurred which is not related to duplicate emails', () => {
            save.mockRejectedValue({ code: '1' })
            expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('validateUserPassword', () => {
        let user;
        beforeEach(() => {
            userRepository.findOne = jest.fn();
            user = new User();
            user.email = 'email@email.com';
            user.password = '12345678';
            user.validatePassword = jest.fn()
        })
        it('should return user if validation succeeded', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(true);

            const result = await userRepository.validateUserPassword(mockSignInDto);
            expect(result).toEqual(user);
        });

        it('should return null if user was not found', async () => {
            userRepository.findOne.mockResolvedValue(null);

            const result = await userRepository.validateUserPassword(mockSignInDto);

            expect(user.validatePassword).not.toHaveBeenCalled();

            expect(result).toBeNull();
        });

        it('should return null if password if incorrect', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(false);

            const result = await userRepository.validateUserPassword(mockSignInDto);

            expect(user.validatePassword).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });
});