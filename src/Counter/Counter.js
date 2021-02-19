import React,{ useEffect } from 'react';
import axios from 'axios';
import "antd/dist/antd.css";
import { useImmer } from "use-immer"
import SHA256 from "crypto-js/sha256";
import myContext from '../context'

import { Input, Select, Button } from "antd";
import styled from 'styled-components'
import SumList from "../SumList/SumList";

//styled-component

const MyInput = styled(Input)`
    margin: 10px;
    width: 400px;
`

const MySelect = styled(Select)`
    margin: 10px;
`

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-around;      
`

const Paragraph = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    padding-right: 272px;
`

const Text = styled.span`
    display: inline-block;
    width: 80px;
    padding: 0 4px;
    box-sizing: border-box;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size : 10px;
    vertical-align: middle;
`

const MyButton = styled(Button)`
        background: #ddd;
        margin: 10px;
        border: none;
        color: #333;
        :hover, :focus{
            background: #ddd;
            color: #333;
        }
`

const { Option } = Select;

function Counter(){
    //state
    const [form, setForm] = useImmer({
       name: "",
       price: "",
       currency: null,
    });
    const [rate, setRate] = useImmer({
            RUB: 0,
            USD: 0
    });
    const [difficulty] = useImmer(2);
    const [chain, setChain] = useImmer([{
        index : 0,
        previousHash : '',
        timestamp : new Date(),
        data : [],
        hash : calculateHash(0,'',new Date(),[],0),
        nonce: 0
    }]);

    //methods
    //UI methods
    const add = () => {
        //form-check
        if (!form.name){
            alert("You need to fill name to input-box!");
            return
        }
        if (!form.price){
            alert("You need to fill price to input-box!");
            return
        }
        if (!form.currency){
            alert("You need to choose currency to select-box!");
            return 
        }
        //state manager
        let transaction = {
            complete: false,
            id: Number(Math.random().toString().substr(3,6) + Date.now()).toString(36)
        };
        transaction.name = form.name;
        transaction.timestamp = new Date();
        switch (form.currency) {
                case 'RUB':
                    transaction.RUB = Number(form.price).toFixed(3);
                    transaction.RMB = (transaction.RUB / rate.RUB).toFixed(3);
                    transaction.USD = (transaction.RMB * rate.USD).toFixed(3);
                    break;

                case 'RMB':
                    transaction.RMB = Number(form.price).toFixed(3);
                    transaction.RUB = (transaction.RMB * rate.RUB).toFixed(3);
                    transaction.USD = (transaction.RMB * rate.USD).toFixed(3);
                    break;

                case 'USD':
                    transaction.USD = Number(form.price).toFixed(3);
                    transaction.RMB = (transaction.USD / rate.USD).toFixed(3);
                    transaction.RUB = (transaction.RMB * rate.RUB).toFixed(3);
                    break;

                default:
                    transaction.RMB = 0;
                    transaction.RUB = 0;
                    transaction.USD = 0;
        }
        transaction.txhash = calculateTxHash(transaction.id, transaction.name, transaction.RUB, transaction.RMB, transaction.USD, transaction.timestamp, transaction.complete)
        if (!isLastestBlockFull()) {
                setChain( draft => {
                    draft[chain.length-1].data.push(transaction);
                    draft[chain.length-1].hash = calculateHash(draft[chain.length-1].index, draft[chain.length-1].previousHash, draft[chain.length-1].timestamp, draft[chain.length-1].data);
                });
                setForm( draft => {
                    draft.name = '';
                    draft.price = '';
                    draft.currency = null;
                });
        } else {
                let block = {
                    data: []
                };
                block.index = chain[chain.length-1].index + 1;
                block.previousHash =  chain[chain.length-1].hash;
                    let now = new Date();
                block.timestamp = now;
                block.data.push(transaction);
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

    function getChain() {
        console.log("chain：");
        console.log(chain);
    }

    //select change
    function selectHandleChange(value) {
        setForm( draft => {
            draft["currency"] = value
        });
    }

    //input change
    const inputHandleChange = ( input ) => {
        setForm( draft => {
            draft[input.target.name] = input.target.value;
        });
    };

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

    //http
    useEffect(() => {
        const fetchData = async () => {
            await axios(
                `https://api.globus.furniture/forex`
            ).then( (result) => {
                    setRate( draft => {
                        draft.RUB = result.data.RUB.value;
                        draft.USD = result.data.USD.value;
                    });
                }
            );
        };
        fetchData();
    }, [setRate]);

    //render
    return (
        <>
            <Header>
                <MyInput placeholder="transaction" name="name" value={ form.name } onChange={ inputHandleChange }></MyInput>
                <MyInput placeholder="price" name="price" value={ form.price } onChange={ inputHandleChange }></MyInput>
                <MySelect placeholder="currency" style={{ width: 240 }} value={ form.currency } onChange={ selectHandleChange }>
                    <Option value="RMB">RMB</Option>
                    <Option value="RUB">RUB</Option>
                    <Option value="USD">USD</Option>
                </MySelect>
                <MyButton onClick={ () => add() }>Add</MyButton>
                <MyButton onClick={ () => getChain() }>Get chain</MyButton>
            </Header>
            <Paragraph>
                <div>Rate：</div>
                <div>
                    <Text>{ (rate.RUB).toFixed(3) }₽/￥</Text>
                    <Text>{ (rate.RUB/rate.USD).toFixed(3) }₽/$</Text>
                    <Text>{ (1/rate.USD).toFixed(3) }￥/$</Text>
                </div>
            </Paragraph>
            <myContext.Provider value={{
                listTitle: 'Plan：',
                sumTitle: 'Cost：',
                data: chain,
                judge: false,
                setData: setChain,
                difficulty: difficulty
            }}>
                <SumList></SumList>
            </myContext.Provider>

            <myContext.Provider value={{
                listTitle: 'Complete：',
                sumTitle: 'Total：',
                data: chain,
                judge: true,
                setData: setChain,
                difficulty: difficulty
            }}>
                <SumList></SumList>
            </myContext.Provider>
        </>
    );
}

export default Counter