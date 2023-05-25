import { addDoc, getDocs, collection, doc, onSnapshot, orderBy, query, where, limit } from 'firebase/firestore'; 
import { db } from './firebase';
import { RECEIPTS_ENUM, onError, props } from '../pages/dashboard';
import { getAuth, signInWithPhoneNumber } from "./auth";


// Name of receipt collection in Firestore
const RECEIPT_COLLECTION = 'receipts';




//gift sms api
//

export async function giftSms(uid, customerName, customerPhone, timestamp, txnType, addAmount, finalBalance) {
  const axios = require("axios");
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, RECEIPT_COLLECTION),
        where('customerPhone', '==', customerPhone),
        where('uid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(1)
      )
    );
    const receipt = querySnapshot.docs[0].data();
    const phoneNumber = '+91' + receipt.customerPhone;
    const giftAmount = receipt.addAmount;


    const apiUrl = 'https://us-central1-walletman-794f4.cloudfunctions.net/proxy?key=2fbd23aac17313073070cd7d18cde21e1340b0dcfbf62755&token=903d1d15a734ada0dd3d68ecb98e8997db258d42a0588bbd&sid=walletman1';
    
    axios.post(apiUrl, /*'/send-sms', */{
      params: {
        phoneNumber: receipt.customerPhone,
        giftAmount: receipt.addAmount
      }
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });

  } catch (error) {
    console.error(error);
  }
}
//

    /* last
    const key = "2fbd23aac17313073070cd7d18cde21e1340b0dcfbf62755";
    const sid = "walletman1";
    const token = "903d1d15a734ada0dd3d68ecb98e8997db258d42a0588bbd";
    const username = encodeURIComponent(key);
    const password = encodeURIComponent(token);
    const from = "WALTMN";
    const DltTemplateId = "1107168300925524168";
    const DltEntityId = "1101674640000069209";

    const body = `Dear Customer,\n\nCONGRATULATIONS !\n\nYou have received a\nCASHBACK worth Rs. ${giftAmount}\nfrom Imaginary Store for being a loyal customer.\n\nYou can use your balance whenever you visit the store next time.\n\nThank You\nWALLETMAN`;
    const formUrlEncoded = x => Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '');

    const url = `https://${username}:${password}@api.exotel.com/v1/Accounts/${sid}/Sms/send.json`;

    
    const response = await axios.post(url, formUrlEncoded({
      "From": from,
      "To": phoneNumber,
      "Body": body,
      "DltTemplateId": DltTemplateId,
      "DltEntityId": DltEntityId
    }), {withCredentials: true,
      headers: {
        "Accept": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    console.log(`SMS sent to ${phoneNumber}. Response: ${response.data}`);
  } catch (error) {
    console.error(error);
  }
}
*/


/* second last
export async function giftSms(uid, customerName, customerPhone, timestamp, txnType, addAmount, finalBalance) {
  const axios = require("axios");
  try {
    const querySnapshot = await getDocs(query(collection(db, RECEIPT_COLLECTION), where('customerPhone', '==', customerPhone),  where('uid', '==', uid), orderBy('timestamp', 'desc'), limit(1)));
    const receipt = querySnapshot.docs[0].data();

    const phoneNumber = '+91' + receipt.customerPhone;
    const giftAmount = receipt.addAmount;
    const key="2fbd23aac17313073070cd7d18cde21e1340b0dcfbf62755";
    const sid="walletman1";
    const token="903d1d15a734ada0dd3d68ecb98e8997db258d42a0588bbd";
    const from="WALTMN";
    const to=phoneNumber;
    const DltTemplateId="1107168300925524168";
    const DltEntityId="1101674640000069209";
    const body="Dear Customer,\n\nCONGRATULATIONS !\n\nYou have received a\nCASHBACK worth Rs. "+giftAmount+"\nfrom Imaginary Store for being a loyal customer.\n\nYou can use your balance whenever you visit the store next time.\n\nThank You\nWALLETMAN";

const formUrlEncoded = x =>Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '');

const axios = require('axios');
const url="https://"+key+":"+token+"@api.exotel.com/v1/Accounts/"+sid+"/Sms/send.json";
axios.post(url, 
   formUrlEncoded({
  "From": from,
  "To": to,
  "Body":body,
  "DltTemplateId": DltTemplateId,
  "DltEntityId": DltEntityId
}),
{   
    withCredentials: true,
    headers: {
        "Accept":"application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded"
    }
  },
  )
.then((res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(res);
})
.catch((error) => {
  console.error(error);
});




  } catch (error) {
    console.error(error);
  }
}
*/

//gift receipt
export async function giftReceipt(uid, customerName, customerPhone, timestamp, txnType, addAmount, finalBalance) {

  try {
    const querySnapshot = await getDocs(query(collection(db, RECEIPT_COLLECTION), where('customerPhone', '==', customerPhone),  where('uid', '==', uid), orderBy('timestamp', 'desc'), limit(1)));

    let finalBalanceValue = 0;
    if (!querySnapshot.empty) {
      const receipt = querySnapshot.docs[0].data();
      finalBalanceValue = receipt.finalBalance;
    }

    const newReceipt = {
      uid, customerName, customerPhone, timestamp, txnType, addAmount,
      finalBalance: addAmount + finalBalanceValue
    };
    await addDoc(collection(db, RECEIPT_COLLECTION), newReceipt);
  } catch (error) {
    console.error(error);
  }
}


//add receipt
export async function addReceipt(uid, customerName, customerPhone, timestamp, txnType, addAmount, finalBalance) {

  try {
    const querySnapshot = await getDocs(query(collection(db, RECEIPT_COLLECTION), where('customerPhone', '==', customerPhone),  where('uid', '==', uid), orderBy('timestamp', 'desc'), limit(1)));

    let finalBalanceValue = 0;
    if (!querySnapshot.empty) {
      const receipt = querySnapshot.docs[0].data();
      finalBalanceValue = receipt.finalBalance;
    }

    const newReceipt = {
      uid, customerName, customerPhone, timestamp, txnType, addAmount,
      finalBalance: addAmount + finalBalanceValue
    };
    await addDoc(collection(db, RECEIPT_COLLECTION), newReceipt);
  } catch (error) {
    console.error(error);
  }
}


// redeem receipt
export async function redeemReceipt(uid, customerName, customerPhone, timestamp, txnType, redeemAmount, finalBalance) {
  try {
    const querySnapshot = await getDocs(query(collection(db, RECEIPT_COLLECTION), where('customerPhone', '==', customerPhone),  where('uid', '==', uid), orderBy('timestamp', 'desc'), limit(1)));

    //let finalBalanceValue = 0;
    if (!querySnapshot.empty) {
      const receipt = querySnapshot.docs[0].data();

      if (receipt.finalBalance < redeemAmount) {
        console.log('low balanceee');
      props.onError(RECEIPTS_ENUM.redeem);
        
      } 
        let finalBalanceValue = receipt.finalBalance - redeemAmount;

        const newReceipt = {
          uid, customerName, customerPhone, timestamp, txnType, redeemAmount,
          finalBalance: finalBalanceValue
        };

        await addDoc(collection(db, RECEIPT_COLLECTION), newReceipt);
        props.onSuccess(RECEIPTS_ENUM.redeem);
        console.log('check');
        
    }
      console.log('no acc');
     // props.onError(RECEIPTS_ENUM.redeem);
  } catch (error) {
  props.onError(RECEIPTS_ENUM.redeem);
}
}


//get with totl balnce

//get receipt
export async function getReceipts(uid, setReceipts, setIsLoadingReceipts) {
  const receiptsQuery = query(collection(db, RECEIPT_COLLECTION), where("uid", "==", uid), orderBy("timestamp", "desc"));
  const unsubscribe = onSnapshot(receiptsQuery, async (snapshot) => {
    let allReceipts = [];
    for (const documentSnapshot of snapshot.docs) {
      const receipt = documentSnapshot.data();
      allReceipts.push({
        ...receipt,  
        timestamp: receipt.timestamp.toDate(),
        id: documentSnapshot.id,
      });
    }
    setReceipts(allReceipts);
    setIsLoadingReceipts(false);
  });
  return unsubscribe;
}



//check balance

export async function checkBalance(uid, customerPhone) {
  try {
    const querySnapshot = await getDocs(query(collection(db, RECEIPT_COLLECTION), where('customerPhone', '==', customerPhone),  where('uid', '==', uid), orderBy('timestamp', 'desc'), limit(1)));
    if (!querySnapshot.empty) {
      const receipt = querySnapshot.docs[0].data();
        const customerBalanceQuery = receipt.finalBalance;
        
        console.log('custo: ', customerBalanceQuery);
        // props.onSuccess(RECEIPTS_ENUM.checkBalance);
        return customerBalanceQuery;
      
      }  
    
  } catch (error) {
    props.onError(RECEIPTS_ENUM.checkBalance);
  }
}



/*
export async function getTotalBalance(uid) {
  try {
    const querySnapshot = await getDocs(query(collection(db, RECEIPT_COLLECTION), where('uid', '==', uid), orderBy('timestamp', 'desc')));

    const customerBalances = {};

    querySnapshot.forEach(doc => {
      const receipt = doc.data();
      const phone = receipt.customerPhone;
      const balance = receipt.finalBalance;

      if (!customerBalances[phone]) {
        customerBalances[phone] = balance;
      } else {
        customerBalances[phone] += balance;
      }
    });

    let totalBalance = 0;
    for (const phone in customerBalances) {
      totalBalance += customerBalances[phone];
    }

    return totalBalance;
  } catch (error) {
    console.error(error);
  }
}
*/


/*
// add receipt with Firebase OTP verification

export async function addReceiptWithFirebaseOTP(uid, customerName, customerPhone, timestamp, txnType, addAmount, finalBalance) {
  try {
    const querySnapshot = await getDocs(query(collection(db, RECEIPT_COLLECTION),
      where('customerPhone', '==', customerPhone),
      orderBy('timestamp', 'desc'),
      limit(1)
    ));
    let finalBalanceValue = 0;

    // Send the OTP to the customer's phone number
    const auth = getAuth();
    const confirmationResult = await signInWithPhoneNumber(auth, customerPhone);
    const verificationId = confirmationResult.verificationId;

    // Ask the user to enter the OTP
    const userOTP = prompt('Please enter the OTP sent to the customer\'s phone number.');

    const credential = PhoneAuthProvider.credential(verificationId, userOTP);
    await auth.signInWithCredential(credential);

    // Set the boolean value to true after OTP verification
    const isOTPVerified = true;
    if (isOTPVerified) {

      if (!querySnapshot.empty) {
        const receipt = querySnapshot.docs[0].data();
        finalBalanceValue = receipt.finalBalance;
      }
      const newReceipt = {
        uid, customerName, customerPhone, timestamp, txnType, addAmount,
        finalBalance: addAmount + finalBalanceValue
      };
      await addDoc(collection(db, RECEIPT_COLLECTION), newReceipt);
    }
  } catch (error) {
    console.error(error);
  }
}


// redeem receipt with Firebase OTP verification

export async function redeemReceiptWithFirebaseOTP(uid, customerName, customerPhone, timestamp, txnType, redeemAmount, finalBalance) {
  try {
    const querySnapshot = await getDocs(query(collection(db, RECEIPT_COLLECTION),
      where('customerPhone', '==', customerPhone),
      orderBy('timestamp', 'desc'),
      limit(1)
    ));

    if (!querySnapshot.empty) {
      const receipt = querySnapshot.docs[0].data();

      if (receipt.finalBalance < redeemAmount) {
        console.log('looooooooow balanceee');
        props.onError(RECEIPTS_ENUM.redeem);
        return;
      }
      
      // Send the OTP to the customer's phone number
      const auth = getAuth();
      const confirmationResult = await signInWithPhoneNumber(auth, customerPhone);
      const verificationId = confirmationResult.verificationId;

      // Ask the user to enter the OTP
      const userOTP = prompt('Please enter the OTP sent to the customer\'s phone number.');

       const credential = PhoneAuthProvider.credential(verificationId, userOTP);
      // await auth.signInWithCredential(credential);
      
      // Set the boolean value to true after OTP verification
      const isOTPVerified = true;
      
      if (isOTPVerified) {
        const finalBalanceValue = receipt.finalBalance - redeemAmount;

        const newReceipt = {
          uid, customerName, customerPhone, timestamp, txnType, redeemAmount,
          finalBalance: finalBalanceValue
        };

        console.log('Doooone daa');
        await addDoc(collection(db, RECEIPT_COLLECTION), newReceipt);
        props.onSuccess(RECEIPTS_ENUM.redeem);

        // Call any other functions that you need to run after successful OTP verification
        // ...
      } else {
        console.log('Incorrect OTP');
        props.onError(RECEIPTS_ENUM.redeem);
        return;
      }
    } else {
      console.log('noooooo acc');
      props.onError(RECEIPTS_ENUM.redeem);
    }
  } catch (error) {
    console.log('errrr');
    props.onError(RECEIPTS_ENUM.redeem);
  }
}
*/
