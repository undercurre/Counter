import React, {useContext} from "react";
import styled from 'styled-components'
import myContext from "../context";
import {Checkbox} from "antd";
import SHA256 from "crypto-js/sha256";

const MyCheckbox = styled(Checkbox)`
    font-size: 10px;
    .ant-checkbox-inner{
        background: #fff;
        border: 2px solid #696969;
        border-radius: 0;
        ::after{
            border: 2px solid #696969;
            border-top: 0;
            border-left: 0;
        }
    }
`

function Judgebox(){

    const { data,judge,chain,queue,setQueue } = useContext(myContext);

    //Judgebox onChange
    function onChange(e) {
        let currentTx = chain.map( item => { return item.data } ).reduce((prev, item) => {
            return prev.concat(item)
        }).filter( item => item.txhash === e.target.value );
        if (currentTx.length === 0){
            currentTx = queue.filter( item => item.txhash === e.target.value );
        }
        let now = new Date();
        let newTx = {
            id: currentTx[0].id,
            name: currentTx[0].name,
            complete: !currentTx[0].complete,
            RUB: currentTx[0].RUB,
            RMB: currentTx[0].RMB,
            USD: currentTx[0].USD,
            timestamp: now,
            txhash: calculateTxHash(currentTx[0].id, currentTx[0].name, currentTx[0].RUB, currentTx[0].RMB, currentTx[0].USD, now, !currentTx[0].complete)
        }
        setQueue(q => {
            q.push(newTx);
        });
    }

    //chaim methods

    function calculateTxHash(id, name, RUB, RMB, USD, timestamp, complete) {
        return SHA256(id + name + RUB + RMB + USD + complete + JSON.stringify(timestamp)).toString();
    }

    if (!judge) {
        return (
            <>
                <MyCheckbox checked={data.complete} value={data.txhash} onChange={onChange}>
                    {data.name}
                </MyCheckbox>
            </>
        );
    } else {
        return (
            <>
                <MyCheckbox checked={data.complete} value={data.txhash} onChange={onChange}>
                    <del>{data.name}</del>
                </MyCheckbox>
            </>
        );
    }
}

export default Judgebox