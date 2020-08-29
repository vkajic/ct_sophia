const { Universal: Ae, MemoryAccount, Node, Crypto } = require('@aeternity/aepp-sdk');
const nacl = require('tweetnacl');
const bip39 = require('bip39');
const smartContract = require('./smartContract.js');
const conf = require('./conf.json');
const logicVersion = 1;

test();


async function test() {
  await smartContract.deploy();

  //await smartContract.initContract();

  //await proxyCall(0, 'signUp', 'cripliM', 'fripsM', 1, 0);
  //await proxyCall(0, 'editProfile', 'cinfoE', 'finfoEdit', 0);
  //await proxyCall(0, 'resetPwd');
  //await proxyCall(3, 'changePwd', 'ak_aocemoguoTDBKGQQYxFZfZsnxZsRxoYb4VqRF1W4gpc22VMFv');
  //await proxyCall(0, 'postTask', 'MEGA 29', 0);
  //await proxyCall(0, 'editTask', 1, 'Mega 2');
  //await proxyCall(2, 'closeApplications', 4);
  //await proxyCall(0, 'reopenApplications', 3);
  //await proxyCall(2, 'applyForTask', 3);
  //await proxyCall(2, 'acceptForTask', 4, 2);
  //await proxyCall(2, 'finalize', 4, 1, 5, 'mmm!');
  //await proxyCall(3, 'cancelContractFlancer', 4, 2, 'so soro');
  //await proxyCall(0, 'cancelContractClient', 4, 2, 1, 'xo xo');
  //await proxyCall(2, 'leaveFeedbackClient', 4, 4, 2, 'loool');
  //await proxyCall(1, 'leaveFeedbackFlancer', 4, 1, 'q rac');
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
  console.log(publicKey);

  const resNonce = await contract.methods.getNonce(keypairFormatted.publicKey);
  const nonce = resNonce.decodedResult;
  console.log('nonce', nonce);

  let args = `${logicVersion.toString()}${nonce.toString()}${functionName}`;
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

  let callCode = `contract.methods.${functionName}('${keypairFormatted.publicKey}', '${sig}', ${logicVersion}, ${nonce}, '${functionName}', ...vargs).then(resBc => { console.log(resBc); })`;
  console.log(callCode);
  eval(callCode);
}
