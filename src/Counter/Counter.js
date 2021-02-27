import React,{ useEffect,useState } from 'react';
import axios from 'axios';
import "antd/dist/antd.css";
import { useImmer } from "use-immer"
import SHA256 from "crypto-js/sha256";
import myContext from '../context'

import {Input, Select, Button, List} from "antd";
import styled from 'styled-components'
import SumList from "../SumList/SumList";
import Judgebox from "../Judgebox/Judgebox";

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

const Title = styled.div`
    margin-left: 10px;
`

const ListParagraph = styled(Paragraph)`
    padding: 10px 0;
    padding-left: 10px;
    padding-right: 30px;
`

const MyList = styled(List)`
    border: 1px solid #696969;
    box-sizing: border-box;
    border-radius: 0;
    display: flex;
    justify-content: center;
    .ant-spin-nested-loading{
        width: 100%;
        .ant-list{
            width: 100%;
        }
        .ant-collapse-items{
            padding: 0;
            margin: 0;
        }
    }
    .ant-list-item{
        border: none;
        padding: 0;
        background: #fff;
        border: 1px solid #696969;
        :last-child{
            border-bottom: 1px solid #696969;
        }
        .ant-list-empty-text{
            padding: 0;
        }
        .ant-collapse{
            width: 100%;
        }
        .ant-collapse-item{
            width: 100%;
            border: none;
        }
        .ant-collapse-header{
            border: none;
            padding: 0;
        }
        .ant-collapse-content{
            border: none;
            .ant-collapse-content-box{
                border-radius: 0;
                padding: 0;
            }
        }
        .ant-list-item{
                padding-right: 0;
                padding-left: 0; 
                background: #ddd;
                border: 1px solid #696969;
                vertical-align: middle;
                .ant-collapse-header{
                    border-radius: 0;
                }
                .ant-collapse-item{
                    border: none;
                }
        }
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
    const [difficulty] = useState(10);
    const [wait, setWait] = useState(0);
    const [queue, setQueue] = useImmer([]);
    const [chain, setChain] = useImmer([{
        index : 0,
        previousHash : '',
        timestamp : new Date(),
        data : [],
        hash : calculateHash(0,'',new Date(),[],0),
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
        transaction.txhash = calculateTxHash(transaction.id, transaction.name, transaction.RUB, transaction.RMB, transaction.USD, transaction.timestamp, transaction.complete);
        setForm( draft => {
            draft.name = '';
            draft.price = '';
            draft.currency = null;
        });
        setQueue(q => {
            q.push(transaction);
        });
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
    function calculateHash(index, previousHash, timestamp, data) {
        return SHA256(index + previousHash + JSON.stringify(timestamp) + JSON.stringify(data)).toString();
    }

    function calculateTxHash(id, name, RUB, RMB, USD, timestamp, complete) {
        return SHA256(id + name + RUB + RMB + USD + complete + JSON.stringify(timestamp)).toString();
    }

    useEffect( () => {
        let timer;
        if (wait !== 0) {
            timer = setInterval(() => {
                setWait(n => {
                    if (n === 1) {
                                let now = new Date();
                                let tempBlock = {
                                    timestamp: now,
                                    data: [],
                                    index: chain[chain.length - 1].index + 1,
                                    previousHash: chain[chain.length - 1].hash
                                }
                                if (queue.length <= 5){
                                    queue.forEach(item => {
                                        tempBlock.data.push(item);
                                    })
                                    setQueue( draft => {
                                        draft.splice(0,queue.length)
                                    })
                                }else{
                                    queue.slice(0, 5).forEach(item => {
                                        tempBlock.data.push(item);
                                    });
                                    setQueue( draft => {
                                        draft.splice(0,5)
                                    })
                                }
                                tempBlock.hash = calculateHash(tempBlock.index, tempBlock.previousHash, tempBlock.timestamp, tempBlock.data);
                                setChain(draft => {
                                    draft.push(tempBlock);
                                });
                                return difficulty
                    }
                    return n - 1
                });
            }, 1000);
            return () => {
                clearInterval(timer);
            }
        }
    },[queue.length,chain,difficulty,queue,setChain,setQueue,wait])

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

    useEffect( () => {
        setWait(difficulty);
    },[setWait,difficulty])

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
            <Paragraph>Add a New Block Need to Wait：{ wait }s</Paragraph>
            <Title>Queue：</Title>
            <MyList
                bordered
                dataSource={ queue }
                renderItem={ item => (
                    <List.Item
                        key={ item.txhash }
                    >
                        <ListParagraph>
                            <div>
                                <myContext.Provider value={{
                                    data: item,
                                    judge: item.complete,
                                    chain: chain,
                                    setChain: setChain,
                                    setWait: setWait,
                                    queue: queue,
                                    setQueue: setQueue,
                                }}>
                                    <Judgebox/>
                                </myContext.Provider>
                            </div>
                            <div>
                                <Text>{ item.RUB }₽</Text>
                                <Text>{ item.RMB }￥</Text>
                                <Text>{ item.USD }$</Text>
                                <Text></Text>
                                <Text></Text>
                                <Text>txHash:{ item.txhash }</Text>
                            </div>
                        </ListParagraph>
                    </List.Item>
                )}
            />
            <myContext.Provider value={{
                listTitle: 'Plan：',
                sumTitle: 'Cost：',
                data: chain,
                judge: false,
                setData: setChain,
                wait: wait,
                setWait: setWait,
                queue: queue,
                setQueue: setQueue,
            }}>
                <SumList></SumList>
            </myContext.Provider>

            <myContext.Provider value={{
                listTitle: 'Complete：',
                sumTitle: 'Total：',
                data: chain,
                judge: true,
                setData: setChain,
                wait: wait,
                setWait: setWait,
                queue: queue,
                setQueue: setQueue,
            }}>
                <SumList></SumList>
            </myContext.Provider>
        </>
    );
}

export default Counter