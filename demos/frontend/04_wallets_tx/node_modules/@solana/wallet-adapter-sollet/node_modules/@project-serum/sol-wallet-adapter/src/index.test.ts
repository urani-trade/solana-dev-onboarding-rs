import Wallet from '.';

describe('Wallet', () => {
  it('is truthy', () => {
    expect(new Wallet('http://localhost:3000', 'mainnet-beta')).toBeTruthy();
  });
});
