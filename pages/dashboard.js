/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import {useState, useEffect} from "react";
import Head from "next/head";
import {useRouter} from "next/router";
import {Alert, Button, CircularProgress, Container, Dialog, DialogContent, DialogActions, Divider, IconButton, Snackbar, Stack, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NavBar from "../components/navbar";
import ReceiptRow from "../components/receiptRow";
import {ExpenseDialog1, ExpenseDialog2, ExpenseDialog3, ExpenseDialog4, customerBalanceQuery, handleBalanceUpdate} from "../components/expenseDialog";
import {useAuth} from "../firebase/auth";
import {getReceipts, checkBalance} from "../firebase/firestore";
import styles from "../styles/dashboard.module.scss";

const ADD_SUCCESS = "Balance added successfully!";
const ADD_ERROR = "Add balance failure!";
const REDEEM_SUCCESS = "Balance redeemed successfully!";
const REDEEM_ERROR = "Low Balance!";
const GIFT_SUCCESS = "Gifted successfully!";
const GIFT_ERROR = "Gift failure!";
let CHECKBALANCE_SUCCESS = "customerBalanceQuery";
const CHECKBALANCE_ERROR = "Check balance failure!";

// Enum to represent different states of receipts
export const RECEIPTS_ENUM = Object.freeze({
  none: 0,
  add: 1,
  redeem: 2,
  gift: 3,
  checkBalance: 4,
});

const SUCCESS_MAP = {
  [RECEIPTS_ENUM.add]: ADD_SUCCESS,
  [RECEIPTS_ENUM.redeem]: REDEEM_SUCCESS,
  [RECEIPTS_ENUM.gift]: GIFT_SUCCESS,
  [RECEIPTS_ENUM.checkBalance]: CHECKBALANCE_SUCCESS,
};

const ERROR_MAP = {
  [RECEIPTS_ENUM.add]: ADD_ERROR,
  [RECEIPTS_ENUM.redeem]: REDEEM_ERROR,
  [RECEIPTS_ENUM.gift]: GIFT_ERROR,
  [RECEIPTS_ENUM.checkBalance]: CHECKBALANCE_ERROR,
};

export default function Dashboard(props) {
  const {authUser, isLoading} = useAuth();
  const router = useRouter();
  const [action, setAction] = useState(RECEIPTS_ENUM.none);
  
  // State involved in loading, setting receipts
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(true);
  const [receipts, setReceipts] = useState([]);

  // State involved in snackbar
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSuccessSnackbar, setSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setErrorSnackbar] = useState(false);

  // Listen for changes to loading and authUser, redirect if needed
  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/");
    }
  }, [authUser, isLoading, router]);

  // Get receipts once user is logged in  
  useEffect(() => {
    async function fetchData() {
      if (authUser !== null) {
        const unsubscribe = await getReceipts(authUser.uid, setReceipts, setIsLoadingReceipts);
        return () => unsubscribe();
      }
    }
    fetchData();
  }, [authUser, router]);
  /*
  useEffect(async () => {
    if (authUser !== null) {
      const unsubscribe = await getReceipts(authUser.uid, setReceipts, setIsLoadingReceipts);
      return () => unsubscribe();
    }
  }, [authUser, router]);
  
  useEffect(async () => {
    if (authUser) {
      const unsubscribe = await getReceipts(authUser.uid, setReceipts, setIsLoadingReceipts);
      return () => unsubscribe();
    }
  }, [authUser])
*/

  // Sets appropriate snackbar message on whether @isSuccess and updates shown receipts if necessary
  const onResult = async (receiptEnum, isSuccess) => {
    setSnackbarMessage(isSuccess ? SUCCESS_MAP[receiptEnum] : ERROR_MAP[receiptEnum]);
    isSuccess ? setSuccessSnackbar(true) : setErrorSnackbar(true);
    setAction(RECEIPTS_ENUM.none);
  };

  // For all of the onClick functions, update the action and fields for updating
  const onClickAdd = () => {
    setAction(RECEIPTS_ENUM.add);
  };
  const onClickRedeem = () => {
    setAction(RECEIPTS_ENUM.redeem);
  };
  const onClickGift = () => {
    setAction(RECEIPTS_ENUM.gift);
  };
  const onClickcheckBalance = () => {
    setAction(RECEIPTS_ENUM.checkBalance);
  };

  // Calculate the size of the icon and text
  // const iconSize = null;
  // const textSize = null;

  return ((!authUser || isLoadingReceipts) ?
    <CircularProgress color="inherit" sx={{marginLeft: "50%", marginTop: "25%"}}/> :
    <div>
      <Head>
        <title>Dashboard | Walletman</title>
      </Head>

      <NavBar />
      <Container>
        <Snackbar open={showSuccessSnackbar} autoHideDuration={4500} onClose={() => setSuccessSnackbar(false)}
          anchorOrigin={{horizontal: "center", vertical: "top"}}>
          <Alert onClose={() => setSuccessSnackbar(false)} severity="success">{snackbarMessage}</Alert>
        </Snackbar>
        <Snackbar open={showErrorSnackbar} autoHideDuration={4500} onClose={() => setErrorSnackbar(false)}
          anchorOrigin={{horizontal: "center", vertical: "top"}}>
          <Alert onClose={() => setErrorSnackbar(false)} severity="error">{snackbarMessage}</Alert>
        </Snackbar>

        {/*
        <Stack direction="row" sx={{paddingTop: "1.5em"}}>
          <IconButton size="medium" iconSize={iconSize} textSize={textSize} aria-label="edit" color="secondary" onClick={onClickAdd} className={styles.actionButton} variant="h4" sx={{lineHeight: 2, paddingRight: "0.5em"}}>
            ADD BALANCE
          </IconButton>
          <IconButton size="medium" iconSize={iconSize} textSize={textSize} aria-label="edit" color="secondary" onClick={onClickRedeem} className={styles.actionButton} variant="h4" sx={{lineHeight: 2, paddingRight: "0.5em"}}>
            REDEEM
          </IconButton>
        </Stack>
        */}

        <Container className={styles.container}>
          <div className={styles.buttons}>
            <Button variant="contained" color="secondary" onClick={onClickAdd} className={styles.actionButton}>
              ADD BALANCE
            </Button>
            <Button variant="contained" color="secondary" onClick={onClickRedeem}>
              REDEEM
            </Button>
            <Button variant="contained" color="secondary" onClick={onClickGift} className={styles.actionButton}>
              GIFT
            </Button>
            <Button variant="contained" color="secondary" onClick={onClickcheckBalance}>
              Check Balance
            </Button>
          </div>
        </Container>

        <div className={styles.gridContainer}>
          <Typography variant="h7" fontWeight="bold">
            Date / Time
          </Typography>
          <Typography variant="h7" fontWeight="bold">
            Transaction Type | Amount 
          </Typography>
          <Typography variant="h7" fontWeight="bold">
            Final Balance
          </Typography>
          <Typography variant="h7" fontWeight="bold">
            Phone Number
          </Typography>
          <Typography variant="h7" fontWeight="bold">
            Customer Name
          </Typography>
        </div>
        <Divider
          variant="fullWidth"
          sx={{
            height: 1,
            backgroundColor: "#000", /* Set background color to black */
            fontWeight: "bold", /* Set font weight to bold */
          }}
        />

        { receipts.map((receipt) => (
          <div key={receipt.id}>
            <Divider light />
            <ReceiptRow receipt={receipt}/>
          </div>),
        )}
      </Container>
      <ExpenseDialog1 showDialog={action === RECEIPTS_ENUM.add}
        onError={(receiptEnum) => onResult(receiptEnum, true)}
        onSuccess={(receiptEnum) => onResult(receiptEnum, true)}
        onCloseDialog={() => setAction(RECEIPTS_ENUM.none)}>
      </ExpenseDialog1>

      <ExpenseDialog2 showDialog={action === RECEIPTS_ENUM.redeem}
        onError={(receiptEnum) => onResult(receiptEnum, true)}
        onSuccess={(receiptEnum) => onResult(receiptEnum, true)}
        onCloseDialog={() => setAction(RECEIPTS_ENUM.none)}>
      </ExpenseDialog2>

      <ExpenseDialog3 showDialog={action === RECEIPTS_ENUM.checkBalance}
        onError={(receiptEnum) => onResult(receiptEnum, true)}
        //onSuccess={(balance) => setBalance(balance)}
        //onSuccess={(balance, setBalance) => setBalance(balance)}
        //onSuccess={handleBalanceUpdate}
        onSuccess={(receiptEnum) => onResult(receiptEnum, true)}
        onCloseDialog={() => setAction(RECEIPTS_ENUM.none)}>
      </ExpenseDialog3>

      <ExpenseDialog4 showDialog={action === RECEIPTS_ENUM.gift}
      onError={(receiptEnum) => onResult(receiptEnum, true)}
      onSuccess={(receiptEnum) => onResult(receiptEnum, true)}
      onCloseDialog={() => setAction(RECEIPTS_ENUM.none)}>
      </ExpenseDialog4>

    </div>
  );
}
