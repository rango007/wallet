import { initializeApp } from 'firebase/app';
const firebaseConfig = {
  apiKey: "AIzaSyDlykvUIw2LzldUNhsRv4Oy7rLA1d8fmQI",
  authDomain: "walletman-794f4.firebaseapp.com",
  projectId: "walletman-794f4",
  storageBucket: "walletman-794f4.appspot.com",
  messagingSenderId: "382588159921",
  appId: "1:382588159921:web:30d104a4890293da1c9f90",
  measurementId: "G-PZQEEJMLEF"
};
const app = initializeApp(firebaseConfig);


import { useState, useEffect, React, props } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../firebase/auth';
import { addReceipt, redeemReceipt, checkBalance, giftReceipt, giftSms } from '../firebase/firestore';
import { RECEIPTS_ENUM, onError } from '../pages/dashboard';
import styles from '../styles/expenseDialog.module.scss';

import { getAuth, RecaptchaVerifier, PhoneAuthProvider, signInWithPhoneNumber, verifyPhoneNumber } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

import { render } from 'react-dom';

import { addDoc, getDocs, collection, doc, onSnapshot, orderBy, query, where, limit } from '../firebase/firestore'; 
import { db } from '../firebase/firebase';

// Default form state for the dialog
const DEFAULT_FORM_STATE = {
  customerName: "",
  customerPhone: "",
  timestamp: new Date(),
  txnType: "",
  addAmount: "",
  redeemAmount: "",
  finalBalance: null
  /*
  //For merchant details:
  userName: 'ABC Mart',
      timestamp: new Date(),
      userId: firebase.auth().currentUser.uid,
      merchant_user_ID: '',
      merchant_name: '',
      business_name: '',
      merchant_email: '',
      merchant_phone: '',
      outstanding_balance: 0,
      address: '[]',
      bank_details: '[]'
  */
      
};

/* 
 Dialog to input receipt information
 
 props:
  - showDialog boolean for whether to show this dialog
  - onError emits to notify error occurred
  - onSuccess emits to notify successfully saving receipt
  - onCloseDialog emits to close dialog
*/

// For add balance dialog form

export function ExpenseDialog1(props) {
  const { authUser } = useAuth();
  const [formFields, setFormFields] = useState(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
  useEffect(() => {
    if (props.showDialog) {
      setFormFields(DEFAULT_FORM_STATE);
    }
  }, [props.showDialog]);

  // Check whether any of the form fields are unedited
  const isDisabledAdd = () => formFields.customerPhone.length === 0 || formFields.addAmount.length === 0;
                     
  // Update given field in the form
  const updateFormField = (event, field) => {
    setFormFields(prevState => ({...prevState, [field]: event.target.value}));
  };

  const closeDialog = () => {
    setIsSubmitting(false);
    props.onCloseDialog();
  };

 
  // Store receipt information to Firestore
  const handleSubmit = async () => {
    setIsSubmitting(true);

  /*  
    const auth = getAuth();
    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
    }, auth);
     
    */
    
    try {
      const timestamp = new Date();
      let finalBalance = 0;
      const addAmount = parseInt(formFields.addAmount);
      const customerName = formFields.customerName;
      const customerPhone = parseInt(formFields.customerPhone);
      const txnType = "Add";  

/*
      const phoneNumber = '+91' + customerPhone;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      const code = prompt("Enter the OTP", "");

      await confirmationResult.confirm(code);
      //const user = userCredential.user;
      console.log('added balance');
 */
 
      // Adding receipt, Store data into Firestore
 
        await addReceipt(authUser.uid, customerName, customerPhone, timestamp, txnType, addAmount, finalBalance);

      props.onSuccess(RECEIPTS_ENUM.add);
    }catch (error) {
      console.log(error);
      props.onError(RECEIPTS_ENUM.add);
    }
    // Clear all form data
    closeDialog();

  };


  // take only number input un the form
  const validateNumberInput = (event, fieldName) => {
    // const phoneRegex = /^[0-9\b]+$/; // regex to match only numbers  
    const numberRegex = /^\d+(\.\d{1,2})?$/; // regex to match positive numbers with up to 2 decimal places
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      // update the form field with the input value if it's empty or matches the regex
      setFormFields({ ...formFields, [fieldName]: event.target.value });
    }
  };
  
  return (
    <Dialog showDialog classes={{paper: styles.dialog}}
      onClose={closeDialog}
      open={props.showDialog}
      component="form">
      <Typography variant="h4" className={styles.title}>
        ADD BALANCE
      </Typography>
    {//  <DialogContent id="recaptcha-container"></DialogContent>
    }<DialogContent className={styles.fields}>
        <TextField color="tertiary" label="Customer Name" variant="standard" value={formFields.customerName} onChange={(event) => updateFormField(event, 'customerName')} />
        <TextField color="tertiary" label="Customer Phone" variant="standard" value={formFields.customerPhone} onChange={(event) => validateNumberInput(event, 'customerPhone')} />
        <TextField color="tertiary" label="Transaction Amount (&#8377;)" variant="standard" value={formFields.addAmount} onChange={(event) => validateNumberInput(event, 'addAmount')} />
       </DialogContent>
      <DialogActions>
        {isSubmitting ? 
          <Button color="secondary" variant="contained" disabled={true}>
            Submitting...
          </Button> :
          <Button color="secondary" variant="contained" onClick={handleSubmit} disabled={isDisabledAdd()}>
            Submit
          </Button>}
      </DialogActions>
    </Dialog>  
  )
}



//For redeem dialog form

export function ExpenseDialog2(props) {

  const { authUser } = useAuth();
  const [formFields, setFormFields] = useState(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
  useEffect(() => {
    if (props.showDialog) {
      setFormFields(DEFAULT_FORM_STATE);
    }
  }, [props.showDialog])

  // Check whether any of the form fields are unedited
  const isDisabledRedeem = () => formFields.customerPhone.length === 0 || formFields.redeemAmount.length === 0;
                     
  // Update given field in the form
  const updateFormField = (event, field) => {
    setFormFields(prevState => ({...prevState, [field]: event.target.value}))
  }

  const closeDialog = () => {
    setIsSubmitting(false);
    props.onCloseDialog();
  }

  // Store receipt information to Firestore
  const handleSubmit = async () => {
    setIsSubmitting(true);


    /*
    const auth = getAuth();
    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
    }, auth);
     */
  
    try {
      const timestamp = new Date();
      let finalBalance = 0;
      const redeemAmount = parseInt(formFields.redeemAmount);
      const customerName = formFields.customerName;
      const customerPhone = parseInt(formFields.customerPhone);
      const txnType = "Redeem";

      const phoneNumber = '+91' + customerPhone;

      /*      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      const code = prompt("Enter the OTP", "");
      userCredential = await confirmationResult.confirm(code);
      const user = userCredential.user;
      console.log('redeemed');

*/
/*
const phoneAuthProvider = new PhoneAuthProvider(auth);
await phoneAuthProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier)
  .then(async (verificationId) => {
    // Prompt the user to enter the verification code
    const verificationCode = window.prompt("Please enter the verification code sent to your phone");
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      try {
      console.log(credential);
      // Adding receipt, Store data into Firestore
      await redeemReceipt(authUser.uid, customerName, customerPhone, timestamp, txnType, redeemAmount, finalBalance);
    } catch (error) {
      console.error("Wrong verification code entered", error);
    }
  })
  .catch((error) => {
    console.error("Phone number verification failed", error);
  });
*/

// Adding receipt, Store data into Firestore
await redeemReceipt(authUser.uid, customerName, customerPhone, timestamp, txnType, redeemAmount, finalBalance);
    
  // props.onSuccess(RECEIPTS_ENUM.redeem);
    } catch (error) {
      props.onError(RECEIPTS_ENUM.redeem);
    }
    // Clear all form data
    closeDialog();
  };


  // take only number input un the form
  const validateNumberInput = (event, fieldName) => {
    // const phoneRegex = /^[0-9\b]+$/; // regex to match only numbers  
    const numberRegex = /^\d+(\.\d{1,2})?$/; // regex to match positive numbers with up to 2 decimal places
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      // update the form field with the input value if it's empty or matches the regex
      setFormFields({ ...formFields, [fieldName]: event.target.value });
    }
  };

  return (
    <Dialog showDialog classes={{paper: styles.dialog}}
      onClose={closeDialog}
      open={props.showDialog}
      component="form">
      <Typography variant="h4" className={styles.title}>
        REDEEM BALANCE
      </Typography>
      <DialogContent id="recaptcha-container"></DialogContent>
      <DialogContent className={styles.fields}>
        <TextField color="tertiary" label="Customer Name" variant="standard" value={formFields.customerName} onChange={(event) => updateFormField(event, 'customerName')} />
        <TextField color="tertiary" label="Customer Phone" variant="standard" value={formFields.customerPhone} onChange={(event) => validateNumberInput(event, 'customerPhone')} />
        <TextField color="tertiary" label="Transaction Amount (&#8377;)" variant="standard" value={formFields.redeemAmount} onChange={(event) => validateNumberInput(event, 'redeemAmount')} />
       </DialogContent>
      <DialogActions>
        {isSubmitting ? 
          <Button color="secondary" variant="contained" disabled={true}>
            Submitting...
          </Button> :
          <Button color="secondary" variant="contained" onClick={handleSubmit} disabled={isDisabledRedeem()}>
            Submit
          </Button>}
      </DialogActions>
    </Dialog> 
  )
}



//For check balance dialog form

export function ExpenseDialog3(props) {

  const { authUser } = useAuth();
  const [formFields, setFormFields] = useState(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
  useEffect(() => {
    if (props.showDialog) {
      setFormFields(DEFAULT_FORM_STATE);
    }
  }, [props.showDialog])

  // Check whether any of the form fields are unedited
  const isDisabledcheckBalance = () => formFields.customerPhone.length === 0;
                     
  // Update given field in the form
  const updateFormField = (event, field) => {
    setFormFields(prevState => ({...prevState, [field]: event.target.value}))
  }

  const closeDialog = () => {
    setIsSubmitting(false);
    props.onCloseDialog();
  }

  // Store receipt information to Firestore
  const handleSubmit = async () => {
    setIsSubmitting(true);

    
    try {
      const timestamp = new Date();
      let finalBalance = 0;
      const customerPhone = parseInt(formFields.customerPhone);
      
      const customerBalanceQuery = await checkBalance(authUser.uid, customerPhone, timestamp, finalBalance, customerBalanceQuery); 
      
      console.log('balo: ', customerBalanceQuery);
      //props.onSuccess(customerBalanceQuery);
      props.onSuccess(RECEIPTS_ENUM.checkBalance);

  
} catch (error) {
      props.onError(RECEIPTS_ENUM.checkBalance);
    }
    // Clear all form data
    closeDialog();
  };


  // take only number input un the form
  const validateNumberInput = (event, fieldName) => {
    // const phoneRegex = /^[0-9\b]+$/; // regex to match only numbers  
    const numberRegex = /^\d+(\.\d{1,2})?$/; // regex to match positive numbers with up to 2 decimal places
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      // update the form field with the input value if it's empty or matches the regex
      setFormFields({ ...formFields, [fieldName]: event.target.value });
    }
  };

  return (
    <Dialog showDialog classes={{paper: styles.dialog}}
      onClose={closeDialog}
      open={props.showDialog}
      component="form">
      <Typography variant="h4" className={styles.title}>
        CHECK BALANCE
      </Typography>
      <DialogContent id="recaptcha-container"></DialogContent>
      <DialogContent className={styles.fields}>
        <TextField color="tertiary" label="Customer Phone" variant="standard" value={formFields.customerPhone} onChange={(event) => validateNumberInput(event, 'customerPhone')} />
        </DialogContent>
      <DialogActions>
        {isSubmitting ? 
          <Button color="secondary" variant="contained" disabled={true}>
            Submitting...
          </Button> :
          <Button color="secondary" variant="contained" onClick={handleSubmit} disabled={isDisabledcheckBalance()}>
            Submit
          </Button>}
      </DialogActions>
    </Dialog> 
  )
}


// For gift dialog form

export function ExpenseDialog4(props) {
  const { authUser } = useAuth();
  const [formFields, setFormFields] = useState(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
  useEffect(() => {
    if (props.showDialog) {
      setFormFields(DEFAULT_FORM_STATE);
    }
  }, [props.showDialog]);

  // Check whether any of the form fields are unedited
  const isDisabledGift = () => formFields.customerPhone.length === 0 || formFields.addAmount.length === 0;
                     
  // Update given field in the form
  const updateFormField = (event, field) => {
    setFormFields(prevState => ({...prevState, [field]: event.target.value}));
  };

  const closeDialog = () => {
    setIsSubmitting(false);
    props.onCloseDialog();
  };
 
  // Store receipt information to Firestore
  const handleSubmit = async () => {
    setIsSubmitting(true);

  /*  
    const auth = getAuth();
    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
    }, auth);
   
    */
    
    try {
      const timestamp = new Date();
      let finalBalance = 0;
      const addAmount = parseInt(formFields.addAmount);
      const customerName = formFields.customerName;
      const customerPhone = parseInt(formFields.customerPhone);
      const txnType = "Gift";  

/*
      const phoneNumber = '+91' + customerPhone;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      const code = prompt("Enter the OTP", "");

      await confirmationResult.confirm(code);
      //const user = userCredential.user;
      console.log('added balance');
 */
 
      // Adding receipt, Store data into Firestore
 
      await giftReceipt(authUser.uid, customerName, customerPhone, timestamp, txnType, addAmount, finalBalance);
      props.onSuccess(RECEIPTS_ENUM.gift);

      await giftSms(authUser.uid, customerName, customerPhone, timestamp, txnType, addAmount, finalBalance);

    }catch (error) {
      console.log(error);
      props.onError(RECEIPTS_ENUM.gift);
    }
    // Clear all form data
    closeDialog();

  };


  // take only number input un the form
  const validateNumberInput = (event, fieldName) => {
    // const phoneRegex = /^[0-9\b]+$/; // regex to match only numbers  
    const numberRegex = /^\d+(\.\d{1,2})?$/; // regex to match positive numbers with up to 2 decimal places
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      // update the form field with the input value if it's empty or matches the regex
      setFormFields({ ...formFields, [fieldName]: event.target.value });
    }
  };
  
  return (
    <Dialog showDialog classes={{paper: styles.dialog}}
      onClose={closeDialog}
      open={props.showDialog}
      component="form">
      <Typography variant="h4" className={styles.title}>
        GIFT
      </Typography>
    {//  <DialogContent id="recaptcha-container"></DialogContent>
    }<DialogContent className={styles.fields}>
        <TextField color="tertiary" label="Customer Name" variant="standard" value={formFields.customerName} onChange={(event) => updateFormField(event, 'customerName')} />
        <TextField color="tertiary" label="Customer Phone" variant="standard" value={formFields.customerPhone} onChange={(event) => validateNumberInput(event, 'customerPhone')} />
        <TextField color="tertiary" label="Gift Amount (&#8377;)" variant="standard" value={formFields.addAmount} onChange={(event) => validateNumberInput(event, 'addAmount')} />
       </DialogContent>
      <DialogActions>
        {isSubmitting ? 
          <Button color="secondary" variant="contained" disabled={true}>
            Submitting...
          </Button> :
          <Button color="secondary" variant="contained" onClick={handleSubmit} disabled={isDisabledGift()}>
            Submit
          </Button>}
      </DialogActions>
    </Dialog>  
  )
}
