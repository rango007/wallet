import { Stack, Typography } from '@mui/material';
import styles from '../styles/receiptRow.module.scss';

/* 
Each row with receipt information
props: receipt data
 - id (doc id of receipt)
 - uid (user id of user who submitted the receipt)
 - customerName:
 - customerphone:
 - timestamp:
 - txnType:
 - addAmount:
 - redeemAmount:
 - finalBalance:
 */
 
 export default function ReceiptRow(props) {
    const receipt = props.receipt;
    
    return (
        <div className={styles.gridContainer}>
          <Typography variant="h3">
            {new Date(receipt.timestamp).toLocaleString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric', 
              hour: 'numeric', minute: 'numeric'
            })}
          </Typography>
          <Typography variant="h3">
            {receipt.txnType} | &#8377;{receipt.addAmount}{receipt.redeemAmount}
          </Typography>
          <Typography variant="h3">
            &#8377;{receipt.finalBalance}
          </Typography>
          <Typography variant="h3">
            {receipt.customerPhone}
          </Typography>
          <Typography variant="h3">
            {receipt.customerName} 
          </Typography>
        </div>
      );

}
