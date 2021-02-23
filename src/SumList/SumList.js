import styled from 'styled-components'
import myContext from "../context";
import React, {useContext} from "react";
import {Collapse, List} from "antd";
import Judgebox from "../Judgebox/Judgebox";

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

const ListParagraph = styled(Paragraph)`
    padding: 10px 0;
    padding-left: 10px;
    padding-right: 30px;
`

const MyCollapse = styled(Collapse)`
        border: none;   
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

const Title = styled.div`
    margin-left: 10px;
`

const { Panel } = Collapse;

function SumList() {

    const { data,listTitle,sumTitle,judge,setData,difficulty,wait,setWait,queue,setQueue,setIsAdding } = useContext(myContext);

    //collapse
    function callback(key) {
        console.log(key);
    }


    return (
        <>
                <Title>{listTitle}</Title>
                <MyList
                    bordered
                    dataSource={ data.map( item => {
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
                    }).reduce((prev,item) => {
                        let index = prev.findIndex( prevItem => prevItem.id === item.id )
                        if (index !== -1) {
                            prev[index] = item;
                        } else {
                            prev.push(item);
                        }
                        return prev
                    },[]).filter( item => item.complete === judge ) }
                    renderItem={ item => (
                        <List.Item
                            key={ item.id }
                        >
                            <MyCollapse
                                defaultActiveKey={[]}
                                onChange={callback}
                                expandIconPosition={'right'}
                            >
                                <Panel header={
                                    <ListParagraph>
                                                    <div>
                                                        <myContext.Provider value={{
                                                            data: item,
                                                            judge: judge,
                                                            chain: data,
                                                            setChain: setData,
                                                            difficulty: difficulty,
                                                            wait: wait,
                                                            setWait: setWait,
                                                            queue: queue,
                                                            setQueue: setQueue,
                                                            setIsAdding: setIsAdding,
                                                        }}>
                                                            <Judgebox/>
                                                        </myContext.Provider>
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
                                } key={item.id}>
                                                <List
                                                    bordered = { false }
                                                    dataSource={ data.map( itemMap => {
                                                        let out = [];
                                                        for (let tx of itemMap.data){
                                                            out.push({
                                                                previousHash : itemMap.previousHash,
                                                                hash : itemMap.hash,
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
                                                    } ).reduce((prev, current) => {
                                                        return prev.concat(current)
                                                    }).filter( itemFiltering => itemFiltering.id === item.id ) }
                                                    renderItem={ itemPanel => (
                                                        <List.Item
                                                            key={ itemPanel.txhash }
                                                        >
                                                            <ListParagraph>
                                                                <div>
                                                                    <myContext.Provider value={{
                                                                        data: itemPanel,
                                                                        judge: itemPanel.complete,
                                                                        chain: data,
                                                                        setChain: setData,
                                                                        difficulty: difficulty,
                                                                        wait: wait,
                                                                        setWait: setWait,
                                                                        queue: queue,
                                                                        setQueue: setQueue,
                                                                        setIsAdding: setIsAdding,
                                                                    }}>
                                                                        <Judgebox></Judgebox>
                                                                    </myContext.Provider>
                                                                </div>
                                                                <div>
                                                                    <Text>{ itemPanel.RUB }₽</Text>
                                                                    <Text>{ itemPanel.RMB }￥</Text>
                                                                    <Text>{ itemPanel.USD }$</Text>
                                                                    <Text>prevHash:{ itemPanel.previousHash }</Text>
                                                                    <Text>hash:{ itemPanel.hash }</Text>
                                                                    <Text>txHash:{ itemPanel.txhash }</Text>
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
            <Paragraph>
                <div>{ sumTitle }</div>
                <div>
                    <Text>{ data.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).reduce((prev,item) => {
                        let index = prev.findIndex( prevItem => prevItem.id === item.id )
                        if (index !== -1) {
                            prev[index] = item;
                        } else {
                            prev.push(item);
                        }
                        return prev
                    },[]).filter( item => item.complete === judge ).reduce((prev, item) => {
                        return prev + parseFloat(item.RUB)
                    }, 0).toFixed(3) }₽</Text>
                    <Text>{ data.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).reduce((prev,item) => {
                        let index = prev.findIndex( prevItem => prevItem.id === item.id )
                        if (index !== -1) {
                            prev[index] = item;
                        } else {
                            prev.push(item);
                        }
                        return prev
                    },[]).filter( item => item.complete === judge ).reduce((prev, item) => {
                        return prev + parseFloat(item.RMB)
                    }, 0).toFixed(3) }￥</Text>
                    <Text>{ data.map( item => { return item.data } ).reduce((prev, item) => {
                        return prev.concat(item)
                    }).reduce((prev,item) => {
                        let index = prev.findIndex( prevItem => prevItem.id === item.id )
                        if (index !== -1) {
                            prev[index] = item;
                        } else {
                            prev.push(item);
                        }
                        return prev
                    },[]).filter( item => item.complete === judge ).reduce((prev, item) => {
                        return prev + parseFloat(item.USD)
                    }, 0).toFixed(3) }$</Text>
                </div>
            </Paragraph>
        </>
    );
}

export default SumList