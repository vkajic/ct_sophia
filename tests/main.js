const { Universal: Ae, MemoryAccount, Node, Crypto } = require('@aeternity/aepp-sdk');
const nacl = require('tweetnacl');
const bip39 = require('bip39');
const smartContract = require('./smartContract.js');
const conf = require('./conf.json');

test();



async function test() {
  await smartContract.initContract();

  await proxyCall(1, 'signUp', 'cifi', 'fifi', 1);
}


async function proxyCall(id, functionName, ...vargs) {
  let contract = smartContract.getContract();

  const seed = bip39.mnemonicToSeedSync(conf.seeds[id]);
  const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
  const secretKey = Buffer.from(keypair.secretKey)
      .toString('hex');
  const publicKey = `ak_${Crypto.encodeBase58Check(keypair.publicKey)}`;
  const keypairFormatted = {
    secretKey,
    publicKey,
  };
  const keypairs = {
    keypair,
    keypairFormatted,
  };

  const resNonce = await contract.methods.getNonce(keypairFormatted.publicKey);
  const nonce = resNonce.decodedResult;
  console.log('nonce', nonce);

  let args = `1${nonce.toString()}${functionName}`;
  for (let i = 0; i < vargs.length; i++) {
    args = args + vargs[i].toString();
  }
  console.log(args);
  const hash = Crypto.hash(args);
  console.log('hash', hash);
  const signedHash = Crypto.sign(hash, keypair.secretKey);
  console.log(signedHash);
  const sig = Buffer.from(signedHash)
      .toString('hex');
  console.log(sig);

  let callCode = `contract.methods.${functionName}('${keypairFormatted.publicKey}', '${sig}', 1, ${nonce}, '${functionName}', ...vargs).then(resBc => { console.log(resBc); })`;
  console.log(callCode);
  eval(callCode);
}
