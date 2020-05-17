const { Universal: Ae, MemoryAccount, Node, Crypto } = require('@aeternity/aepp-sdk');
const nacl = require('tweetnacl');
const bip39 = require('bip39');
const smartContract = require('./smartContract.js');
const conf = require('./conf.json');
const logicVersion = 5;

test();



async function test() {
  await smartContract.initContract();

  //await proxyCall(1, 'signUp', 'cripli', 'frips', 1);
  //await proxyCall(0, 'editProfile', 'cinfoE', 'finfoEdit', 0);
  //await proxyCall(0, 'resetPwd');
  //await proxyCall(3, 'changePwd', 'ak_aocemoguoTDBKGQQYxFZfZsnxZsRxoYb4VqRF1W4gpc22VMFv');
  //await proxyCall(0, 'postTask', 'MEGA 18');
  //await proxyCall(0, 'editTask', 1, 'Mega 2');
  //await proxyCall(0, 'closeApplications', 1);
  //await proxyCall(0, 'reopenApplications', 1);
  //await proxyCall(1, 'applyForTask', 3);
  //await proxyCall(0, 'acceptForTask', 3, 2);
  //await proxyCall(0, 'finalize', 3, 2, 5, 'mmm!');
  //await proxyCall(1, 'cancelContractFlancer', 1, 3, 'so so');
  //await proxyCall(0, 'cancelContractClient', 1, 2, 5, 'xo xo');
  //await proxyCall(0, 'leaveFeedbackClient', 1, 2, 5, 'lol');
  //await proxyCall(1, 'leaveFeedbackFlancer', 3, 5, 'mmm ufff');
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
