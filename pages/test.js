/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import {useEffect, useState} from "react";
import Head from "next/head";
import {useRouter} from "next/router";
import {Button, CircularProgress, Container, TextField, Typography} from "@mui/material";
import {useAuth} from "../firebase/auth";
import styles from "../styles/landing.module.scss";

import {db} from "../firebase/firebase";
import {collection, addDoc} from "firebase/firestore"; // Importing Firestore functions from the modular SDK


const REDIRECT_PAGE = "/dashboard";


export default function Home() {
  const {authUser, isLoading} = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");

  // Redirect if finished loading and there's an existing user (user is logged in)
  useEffect(() => {
    if (!isLoading && authUser) {
      router.push(REDIRECT_PAGE);
    }
  }, [authUser, isLoading, router]);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();
    // Save the email to Firestore collection
    try {
      const docRef = await addDoc(collection(db, "subscribers"), {
        email: email,
        timestamp: new Date(),
      });
      console.log("Email added to subscribers collection with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding email to subscribers collection: ", error);
    }
    setEmail("");
  };

  return ((isLoading || (!isLoading && !!authUser)) ?
    <CircularProgress color="inherit" sx={{marginLeft: "50%", marginTop: "25%"}}/> :
    <div>
      <Head>
        <title>Walletman</title>
      </Head>

      <main>
        <Container className={styles.container}>
          <Typography variant="h2">Walletman for Businesses</Typography><br></br>
          {/*
          <Typography variant="h1">&quot;Let customers pay in advance for cashbacks.&quot;</Typography>
          */}
          <Typography variant="h3">We have launched our beta version and first 100 merchants to register will get 3-months free trial. To participate, enter joinlist. To login, a link will be sent to you via email.</Typography>
          {/*
          <div className={styles.buttons}>
            <Button variant="contained" color="secondary"
              onClick={() => setLogin(true)}>
              Login / Register
            </Button>
          </div>
          <Dialog onClose={() => setLogin(false)} open={login}>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}/>
          </Dialog>
          */}
          <br></br>
          <form onSubmit={handleSubscribe} className={styles.subscribe}>
            <TextField
              label="Enter email to Join the list"
              variant="outlined"
              type="email"
              value={email}
              onChange={handleEmailChange}
              InputProps={{
                endAdornment: (
                  <Button type="submit" variant="contained" color="secondary" style={{marginLeft: "10px", height: "50px"}}>Join</Button>
                ),
              }}
              style={{width: "500px"}} // increase width of the input field
              inputProps={{style: {padding: "10px"}}} // increase padding of the input field text
            />
          </form>
        </Container>
      </main>
    </div>
  );
}
