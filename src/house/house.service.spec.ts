import { Test } from '@nestjs/testing'
import { HouseService } from './house.service';
import { User } from '../auth/user.entity';
import { UsersService } from '../users/users.service';
import { HouseRepository } from './house.repository';
import { UserRepository } from '../auth/user.repository';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

const mockUser = { id: 1, email: 'email@email.com', username: 'user1' }

const mockHouseRepository = () => ({
    getHouseById: jest.fn(),
    createHouse: jest.fn()
});

const mockUsersRepository = () => ({

});

describe('HouseService', () => {
    let houseService;
    let houseRepository;
    let usersService;
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                HouseService,
                UsersService,
                { provide: HouseRepository, useFactory: mockHouseRepository },
                { provide: UserRepository, useFactory: mockUsersRepository }
            ]
        }).compile();

        houseService = await module.get<HouseService>(HouseService);
        houseRepository = await module.get<HouseRepository>(HouseRepository);
        usersService = await module.get<UsersService>(UsersService);
        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('getHouseById', () => {
        const mockHouse = { name: 'house name', creatorId: '1' }
        it('gets a house with given id from the repository', async () => {
            houseRepository.getHouseById.mockResolvedValue(mockHouse);

            const result = await houseService.getHouseById(1, mockUser);

            expect(houseRepository.getHouseById).toHaveBeenCalledWith(1, mockUser);
            expect(result).toEqual(mockHouse)
        });

        it('throws an error when house is not found', async () => {
            houseRepository.getHouseById.mockRejectedValue(null);

            expect(houseService.getHouseById(1, mockUser)).rejects.toThrow(NotFoundException);
        })
    });

    describe('createHouse', () => {
        const createHouseDto = { name: 'house 2', };
        it('should call houseRepository.create() and return the result', async () => {
            houseRepository.createHouse.mockResolvedValue('someHouse');
            const result = await houseRepository.createHouse(createHouseDto, mockUser);
            expect(houseRepository.createHouse).toHaveBeenCalledWith(createHouseDto, mockUser);
            expect(result).toEqual('someHouse');
        });
    });
});