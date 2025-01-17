const { assert } = require('chai');
const { utils, wallets } = require('@aeternity/aeproject');

const EXAMPLE_CONTRACT_SOURCE = './contracts/ExampleContract.aes';

describe('ExampleContract', () => {
  let aeSdk;
  let contract;

  before(async () => {
    aeSdk = await utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);

    // get content of contract
    const source = utils.getContractContent(EXAMPLE_CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, filesystem });
    await contract.deploy();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  it('ExampleContract: set and get', async () => {
    const set = await contract.methods.set(42, { onAccount: wallets[1].publicKey });
    assert.equal(set.decodedEvents[0].name, 'SetXEvent');
    assert.equal(set.decodedEvents[0].args[0], wallets[1].publicKey);
    assert.equal(set.decodedEvents[0].args[1], 42);

    const { decodedResult } = await contract.methods.get();
    assert.equal(decodedResult, 42);
  });

  it('ExampleContract: get undefined when not set before', async () => {
    const { decodedResult } = await contract.methods.get();
    assert.equal(decodedResult, undefined);
  });
});
