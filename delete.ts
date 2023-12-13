const searchParams = new URLSearchParams();
searchParams.append('key_1', 'value_1');
searchParams.append('key_1', 'value_2');
searchParams.append('key_1', 'value_3');
searchParams.append('key_1', 'value_4');
console.log(searchParams.toString());

const data = await fetch(
  'https://ucf4342a98161ac76dc7da6ca5e0.dl.dropboxusercontent.com/cd/0/get/CImaCzpnphl120Jvs-J-vu_TO_fZQPEam4vFYB-DQv7WB7sNSoS0DbH86-C0Z3da2ZGXYliS77Aei71V66FBDoWZ-hJ1nu1KFQJVG8Blz98RpQ-Ys8It3rGiZwsX8PsMKoH9S0ssW9FQZdpxUNHSCmDQKxoSIx0zQ6o9Ie96EdXc8A/file',
);

console.log(await data.text());
console.log(await data.arrayBuffer);
const yo = new ArrayBuffer(50);
ArrayBuffer;
