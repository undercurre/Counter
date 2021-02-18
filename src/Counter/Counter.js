import React,{ useEffect } from 'react';
import axios from 'axios';
import "antd/dist/antd.css";
import { useImmer } from "use-immer"
import SHA256 from "crypto-js/sha256";

import { Input, Select, Button, List, Checkbox, Collapse } from "antd";
import styled from 'styled-components'

//styled-component

const MyCollapse = styled(Collapse)`
        border: none;   
`

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

const Title = styled.div`
    margin-left: 10px;
`

const ListParagraph = styled(Paragraph)`
    padding: 10px 0;
    padding-left: 10px;
    padding-right: 30px;
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
        .ant-list-empty-text{
            padding: 0;
        }
        .ant-collapse{
            width: 100%;
        }
        .ant-collapse-item{
            width: 100%;
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

const { Option } = Select;
const { Panel } = Collapse;

function Counter(){
    //state
    const [form, setForm] = useImmer({
       name: "",
       price: "",
       currency: null,
    });
    const [transaction, setTransaction] = useImmer({
            id: Number(Math.random().toString().substr(3,6) + Date.now()).toString(36),
            name: "",
            complete: false,
            RMB: 0,
            RUB: 0,
            USD: 0,
            timestamp: null,
            txhash: ''
    });
    const [rate, setRate] = useImmer({
            RUB: 0,
            USD: 0
    });
    const [difficulty,setDifficulty] = useImmer(4);
    const [chain, setChain] = useImmer([{
        index : 0,
        previousHash : '',
        timestamp : new Date(),
        data : [],
        hash : calculateHash(0,'',new Date(),[],0),
        nonce: 0
    }]);
    const [block, setBlock] = useImmer({
        index: 0,
        previousHash: '',
        timestamp: new Date(),
        data: [],
        hash: calculateHash(0,'',new Date(),[],0),
        nonce: 0
    });

    //method
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
        setTransaction( draft => {
            draft.name = form.name;
            draft.timestamp = new Date();
            switch (form.currency) {
                case 'RUB':
                    draft.RUB = Number(form.price).toFixed(3);
                    draft.RMB = (draft.RUB / rate.RUB).toFixed(3);
                    draft.USD = (draft.RMB * rate.USD).toFixed(3);
                    break;

                case 'RMB':
                    draft.RMB = Number(form.price).toFixed(3);
                    draft.RUB = (draft.RMB * rate.RUB).toFixed(3);
                    draft.USD = (draft.RMB * rate.USD).toFixed(3);
                    break;

                case 'USD':
                    draft.USD = Number(form.price).toFixed(3);
                    draft.RMB = (draft.USD / rate.USD).toFixed(3);
                    draft.RUB = (draft.RMB * rate.RUB).toFixed(3);
                    break;

                default:
                    draft.RMB = 0;
                    draft.RUB = 0;
                    draft.USD = 0;
            }
            draft.txhash = calculateTxHash(draft.id, draft.name, draft.RUB, draft.RMB, draft.USD, draft.timestamp, draft.complete)
        })
    }

    function getChain() {
        console.log("chain：");
        console.log(chain);
    }

    //collapse
    function callback(key) {
        console.log(key);
    }

    //select change
    function selectHandleChange(value) {
        setForm( draft => {
            draft["currency"] = value
        });
    }

    //checkbox onChange
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
            setBlock( draft => {
                draft.index = chain[chain.length-1].index + 1;
                draft.previousHash =  chain[chain.length-1].hash;
                let now = new Date();
                draft.timestamp = now;
                draft.data.push(newTx);
                draft.nonce = mineBlock(difficulty, draft.hash, draft.nonce, draft).nonce;
                draft.hash = mineBlock(difficulty, draft.hash, draft.nonce, draft).hash;
            })
        }
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

    function mineBlock(difficulty, hash, nonce, draft) {
        hash = calculateHash(draft.index, draft.previousHash, draft.timestamp, draft.data, draft.nonce);
        while (hash.substring(0, difficulty) !== Array(difficulty +1).join("0")) {
            nonce++;
            hash = calculateHash(draft.index, draft.previousHash, draft.timestamp, draft.data, nonce);
            console.log(nonce);
            console.log(hash);
        }
        return {
            hash: hash,
            nonce: nonce
        }
    }

    useEffect( () => {
        if (block.index === 0){
            return
        } else {
            setChain(draft => {
                draft.push(block);
            })
        }
    },[setChain,block.index])

    useEffect( () => {
        console.log(block);
    },[block.hash])

    useEffect( () => {
        if (transaction.USD && transaction.RMB && transaction.RUB){
                if (!isLastestBlockFull()) {
                    setChain( draft => {
                        draft[chain.length-1].data.push(transaction);
                        draft[chain.length-1].hash = calculateHash(draft[chain.length-1].index, draft[chain.length-1].previousHash, draft[chain.length-1].timestamp, draft[chain.length-1].data);
                    });
                    setTransaction( draft => {
                        draft.id = Number(Math.random().toString().substr(3,6) + Date.now()).toString(36);
                    });
                    setForm( draft => {
                        draft.name = '';
                        draft.price = '';
                        draft.currency = null;
                    });
                } else {
                    setBlock( draft => {
                        draft.index = chain[chain.length-1].index + 1;
                        draft.previousHash =  chain[chain.length-1].hash;
                        let now = new Date();
                        draft.timestamp = now;
                        draft.data.push(transaction);
                        draft.nonce = mineBlock(difficulty, draft.hash, draft.nonce, draft).nonce;
                        draft.hash = mineBlock(difficulty, draft.hash, draft.nonce, draft).hash;
                    })
                }
        }
    },[transaction.USD,transaction.RMB,transaction.RUB,setTransaction,setForm,setBlock,setChain])

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
            <Title>Plan：</Title>
                <MyList
                        bordered
                        dataSource={ chain }
                        renderItem={ itemBlock => (
                            <List.Item
                                key={ itemBlock.hash }
                            >
                                <List
                                    locale = { ((itemBlock.data.filter( item => item.complete === false ).length === 0)&&!(chain[0].data.length === 0)) ? {emptyText: " "}:{emptyText: ""} }
                                    bordered = { false }
                                    dataSource={ itemBlock.data.filter( item => item.complete === false ) }
                                    renderItem={ itemTx => (
                                        <List.Item
                                            key={ itemTx.txhash }
                                        >
                                            <MyCollapse
                                                defaultActiveKey={[]}
                                                onChange={callback}
                                                expandIconPosition={'right'}
                                            >
                                                <Panel header={
                                                    <ListParagraph>
                                                                <div>
                                                                        <MyCheckbox checked={ itemTx.complete } value={ itemTx.txhash } onChange={ onChange }>{ itemTx.name }</MyCheckbox>
                                                                </div>
                                                                <div>
                                                                    <Text>{ itemTx.RUB }₽</Text>
                                                                    <Text>{ itemTx.RMB }￥</Text>
                                                                    <Text>{ itemTx.USD }$</Text>
                                                                    <Text>prevHash:{ itemBlock.previousHash }</Text>
                                                                    <Text>hash:{ itemBlock.hash }</Text>
                                                                    <Text>txHash:{ itemTx.txhash }</Text>
                                                                </div>
                                                    </ListParagraph>
                                                } key={itemTx.hash}>
                                                    <List
                                                        bordered = { false }
                                                        dataSource={ chain.map( item => {
                                                            let out = [];
                                                            for (let tx of item.data){
                                                                out.push({
                                                                    previousHash : item.previousHash,
                                                                    hash : item.hash,
                                                                    id : tx.id,
                                                                    name : tx.name,
                                                                    complete : tx.complete,
                                                                    RMB : tx.RMB,
                                                                    RUB : tx.RUB,
                                                                    USD : tx.USD,
                                                                    timestamp : tx.timestamp,
                                                                    txhash : tx.txhash
                                                                });
                                                            }
                                                            return out
                                                        } ).reduce((prev, item) => {
                                                            return prev.concat(item)
                                                        }).filter( item => item.id === itemTx.id ) }
                                                        renderItem={ item => (
                                                            <List.Item
                                                                key={ item.txhash }
                                                            >
                                                                <ListParagraph>
                                                                    <div>
                                                                        <MyCheckbox disabled checked={ item.complete } value={ item.txhash } onChange={ onChange }>{ item.name }</MyCheckbox>
                                                                    </div>
                                                                    <div>
                                                                        <Text>{ item.RUB }₽</Text>
                                                                        <Text>{ item.RMB }￥</Text>
                                                                        <Text>{ item.USD }$</Text>
                                                                        <Text>prevHash:{ item.previousHash }</Text>
                                                                        <Text>hash:{ item.hash }</Text>
                                                                        <Text>txHash:{ item.txhash }</Text>
                                                                    </div>
                                                                </ListParagraph>
                                                            </List.Item>
                                                        )}
                                                    />
                                                </Panel>
                                            </MyCollapse>
                                        </List.Item>
                                    )}
                                />
                            </List.Item>
                        )}
                />
            <Paragraph>
                <div>Cost：</div>
                <div>
                    <Text>{ chain.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).filter( item => item.complete === false ).reduce((prev, item) => {
                        return prev + parseFloat(item.RUB)
                    }, 0).toFixed(3) }₽</Text>
                    <Text>{ chain.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).filter( item => item.complete === false ).reduce((prev, item) => {
                        return prev + parseFloat(item.RMB)
                    }, 0).toFixed(3) }￥</Text>
                    <Text>{ chain.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).filter( item => item.complete === false ).reduce((prev, item) => {
                        return prev + parseFloat(item.USD)
                    }, 0).toFixed(3) }$</Text>

                </div>
            </Paragraph>
            <Title>Complete：</Title>
                <MyList
                    bordered
                    dataSource={ chain }
                    renderItem={ itemBlock => (
                        <List.Item
                            key={ itemBlock.hash }
                        >
                            <List
                                locale = { ((itemBlock.data.filter( item => item.complete === true ).length === 0)&&!(chain[0].data.length === 0)) ? {emptyText: " "}:{emptyText: ""} }
                                bordered = { false }
                                dataSource={ itemBlock.data.filter( item => item.complete === true ) }
                                renderItem={ itemTx => (
                                    <List.Item
                                        key={ itemTx.txhash }
                                    >
                                        <MyCollapse
                                            defaultActiveKey={[]}
                                            onChange={callback}
                                            expandIconPosition={'right'}
                                        >
                                            <Panel header={
                                                <ListParagraph>
                                                            <div>
                                                                    <MyCheckbox checked={ itemTx.complete } value={ itemTx.txhash } onChange={ onChange }><del>{ itemTx.name }</del></MyCheckbox>
                                                            </div>
                                                            <div>
                                                                <Text>{ itemTx.RUB }₽</Text>
                                                                <Text>{ itemTx.RMB }￥</Text>
                                                                <Text>{ itemTx.USD }$</Text>
                                                                <Text>prevHash:{ itemBlock.previousHash }</Text>
                                                                <Text>hash:{ itemBlock.hash }</Text>
                                                                <Text>txHash:{ itemTx.txhash }</Text>
                                                            </div>
                                                </ListParagraph>
                                                } key={itemTx.id}>
                                                <List
                                                    bordered = { false }
                                                    dataSource={ chain.map( item => {
                                                        let out = [];
                                                        for (let tx of item.data){
                                                            out.push({
                                                                previousHash : item.previousHash,
                                                                hash : item.hash,
                                                                id : tx.id,
                                                                name : tx.name,
                                                                complete : tx.complete,
                                                                RMB : tx.RMB,
                                                                RUB : tx.RUB,
                                                                USD : tx.USD,
                                                                timestamp : tx.timestamp,
                                                                txhash : tx.txhash
                                                            });
                                                        }
                                                        return out
                                                    } ).reduce((prev, item) => {
                                                        return prev.concat(item)
                                                    }).filter( item => item.id === itemTx.id ) }
                                                    renderItem={ item => (
                                                        <List.Item
                                                            key={ item.txhash }
                                                        >
                                                            <ListParagraph>
                                                                <div>
                                                                    <MyCheckbox disabled checked={ item.complete } value={ item.txhash } onChange={ onChange }>{ item.name }</MyCheckbox>
                                                                </div>
                                                                <div>
                                                                    <Text>{ item.RUB }₽</Text>
                                                                    <Text>{ item.RMB }￥</Text>
                                                                    <Text>{ item.USD }$</Text>
                                                                    <Text>prevHash:{ item.previousHash }</Text>
                                                                    <Text>hash:{ item.hash }</Text>
                                                                    <Text>txHash:{ item.txhash }</Text>
                                                                </div>
                                                            </ListParagraph>
                                                        </List.Item>
                                                    )}
                                                />
                                            </Panel>
                                        </MyCollapse>
                                    </List.Item>
                                )}
                            />
                        </List.Item>
                    )}
                />
            <Paragraph>
                <div>Total：</div>
                <div>
                    <Text>{ chain.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).filter( item => item.complete === true ).reduce((prev, item) => {
                        return prev + parseFloat(item.RUB)
                    }, 0).toFixed(3) }₽</Text>
                    <Text>{ chain.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).filter( item => item.complete === true ).reduce((prev, item) => {
                        return prev + parseFloat(item.RMB)
                    }, 0).toFixed(3) }￥</Text>
                    <Text>{ chain.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).filter( item => item.complete === true ).reduce((prev, item) => {
                        return prev + parseFloat(item.USD)
                    }, 0).toFixed(3) }$</Text>

                </div>
            </Paragraph>
        </>
    );
}

export default Counter