import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RefreshController } from './refresh.controller';
import { RefreshService } from './refresh.service';

describe('RefreshController', () => {
  let controller: RefreshController;
  const refreshService = { logout: jest.fn(), refresh: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [RefreshController],
      providers: [
        { provide: RefreshService, useValue: refreshService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    controller = moduleRef.get(RefreshController);
  });

  it('B-T09 logout borra la cookie rt con el mismo path', async () => {
    const req = { cookies: { rt: 'cookie-rt' } } as never;
    const res = { clearCookie: jest.fn() } as never;

    const result = await controller.logout(req, res);

    expect(refreshService.logout).toHaveBeenCalledWith('cookie-rt');
    expect((res as { clearCookie: jest.Mock }).clearCookie).toHaveBeenCalledWith('rt', {
      path: '/auth',
    });
    expect(result).toEqual({ message: 'Sesion cerrada' });
  });
});
