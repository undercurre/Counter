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

    const { data,judge,chain,setChain,difficulty } = useContext(myContext);

    //Judgebox onChange
    function onChange(e) {
        let currentTx = chain.map( item => { return item.data } ).reduce((prev, item) => {
            return prev.concat(item)
        }).filter( item => item.txhash === e.target.value );
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
        if ( !isLastestBlockFull() ) {
            setChain( draft => {
                draft[chain.length-1].data.push(newTx);
                draft[chain.length-1].hash = calculateHash(draft[chain.length-1].index, draft[chain.length-1].previousHash, draft[chain.length-1].timestamp, draft[chain.length-1].data);
            });
        } else {
            let block = {
                data: []
            };
            block.index = chain[chain.length-1].index + 1;
            block.previousHash =  chain[chain.length-1].hash;
            let now = new Date();
            block.timestamp = now;
            block.data.push(newTx);
            block.nonce = 0;
            block.hash = calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.nonce);
            let miner = mineBlock(difficulty, block);
            block.nonce = miner.nonce;
            block.hash = miner.hash;
            setChain(draft => {
                draft.push(block);
            })
        }
    }

    //chaim methods
    function calculateHash(index, previousHash, timestamp, data, nonce) {
        return SHA256(index + previousHash + JSON.stringify(timestamp) + JSON.stringify(data) + nonce).toString();
    }

    function calculateTxHash(id, name, RUB, RMB, USD, timestamp, complete) {
        return SHA256(id + name + RUB + RMB + USD + complete + JSON.stringify(timestamp)).toString();
    }

    function isLastestBlockFull() {
        if (chain[chain.length - 1].data.length >= 5) {
            return true
        }
        return false
    }

    function mineBlock(difficulty, block) {
        let nonce = 0;
        let hash = block.hash;
        while (hash.substring(0, difficulty) !== Array(difficulty +1).join("0")) {
            nonce++;
            hash = calculateHash(block.index, block.previousHash, block.timestamp, block.data, nonce);
        }
        return {
            hash: hash,
            nonce: nonce
        }
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