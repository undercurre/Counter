import React,{ useEffect } from 'react';
import axios from 'axios';
import "antd/dist/antd.css";
import { useImmer } from "use-immer"

import { Input, Select, Button, List, Checkbox } from "antd";
import styled from 'styled-components'

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
`

const Title = styled.div`
    margin-left: 10px;
`

const ListParagraph = styled(Paragraph)`
    padding: 10px 0;
    padding-left: 10px;
`

const Text = styled.span`
    display: inline-block;
    width: 132px;
    padding: 0 24px;
    box-sizing: border-box;
    text-align: center;
`

const Complete = styled.span`
    text-decoration:line-through;
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
    border: 2px solid #696969;
    box-sizing: border-box;
    border-radius: 0;
    margin: 10px;
    .ant-list-item{
        padding-right: 0;
        padding-left: 0; 
        background: #ddd;
        border-bottom: 1px solid #696969;
    }
`

const MyCheckbox = styled(Checkbox)`
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

const { Option } = Select

function Counter(){
    //state
    const [state, setState] = useImmer({
        task: {
            id: Number(Math.random().toString().substr(3,6) + Date.now()).toString(36),
            name: "",
            price: "",
            currency: null,
            complete: false
        },
        rate: {
            RUB: 0,
            USD: 0
        },
        list: [],
    });

    //method
    const add = () => {
        //form-check
        if (!state.task.name){
            alert("You need to fill name to input-box!")
            return
        };
        if (!state.task.price){
            alert("You need to fill price to input-box!")
            return
        };
        if (!state.task.currency){
            alert("You need to choose currency to select-box!")
            return 
        };
        //state manager
        setState( draft => {
            switch (state.task.currency) {
                case 'RUB':
                    draft.task.RUB = Number(state.task.price).toFixed(5);
                    draft.task.RMB = (draft.task.RUB / draft.rate.RUB).toFixed(5);
                    draft.task.USD = (draft.task.RMB * draft.rate.USD).toFixed(5);
                    break;

                case 'RMB':
                    draft.task.RMB = Number(state.task.price).toFixed(5);
                    draft.task.RUB = (draft.task.RMB * draft.rate.RUB).toFixed(5);
                    draft.task.USD = (draft.task.RMB * draft.rate.USD).toFixed(5);
                    break;

                case 'USD':
                    draft.task.USD = Number(state.task.price).toFixed(5);
                    draft.task.RMB = (draft.task.USD / draft.rate.USD).toFixed(5);
                    draft.task.RUB = (draft.task.RMB * draft.rate.RUB).toFixed(5);
                    break;

                default:
                    draft.task.RMB = 0;
                    draft.task.RUB = 0;
                    draft.task.USD = 0;
            };
            draft.list.push(draft.task);
        })
        setState( draft => {
            draft.task.id = Number(Math.random().toString().substr(3,6) + Date.now()).toString(36);
            draft.task.name = "";
            draft.task.price = "";
            draft.task.currency = null;
            draft.task.complete = false;
        });
    }

    //select change
    function selectHandleChange(value) {
        setState( draft => {
            draft.task["currency"] = value
        });
    }

    //checkbox onChange
    function onChange(e) {
        setState( draft => {
            if ( state.list.find( item => item.id === e.target.value ).complete ){
                    draft.list.find( item => item.id === e.target.value ).complete = false;
            } else {
                    draft.list.find( item => item.id === e.target.value ).complete = true;
            }
        });
    }

    //input change
    const inputHandleChange = ( input ) => {
        setState( draft => {
            draft.task[input.target.name] = input.target.value;
        });
    };

    //http
    useEffect(() => {
        const fetchData = async () => {
            await axios(
                `https://api.globus.furniture/forex`
            ).then( (result) => {
                    setState( draft => {
                        draft.rate.RUB = result.data.RUB.value;
                        draft.rate.USD = result.data.USD.value;
                    });
                }
            );
        };
        fetchData()
    }, []);

    //render
    return (
        <>
            <Header>
                <MyInput placeholder="task" name="name" value={ state.task.name } onChange={ inputHandleChange }></MyInput>
                <MyInput placeholder="price" name="price" value={ state.task.price } onChange={ inputHandleChange }></MyInput>
                <MySelect placeholder="currency" style={{ width: 240 }} value={ state.task.currency } onChange={ selectHandleChange }>
                    <Option value="RMB">RMB</Option>
                    <Option value="RUB">RUB</Option>
                    <Option value="USD">USD</Option>
                </MySelect>
                <MyButton onClick={ () => add() }>Add</MyButton>
            </Header>
            <Paragraph>
                <div>Exchange rate：</div>
                <div>
                    <Text>{ (state.rate.RUB/1).toFixed(5) }₽/￥</Text>
                    <Text>{ (state.rate.RUB/state.rate.USD).toFixed(5) }₽/$</Text>
                    <Text>{ (1/state.rate.USD).toFixed(5) }￥/$</Text>
                </div>
            </Paragraph>
            <Title>Plan：</Title>
            <MyList
                    bordered
                    dataSource={ state.list.filter( item => item.complete === false ) }
                    renderItem={ item => (
                        <List.Item
                            key={ item.id }
                        >
                            <ListParagraph>
                                <div>
                                    <MyCheckbox checked={ item.complete } value={ item.id } onChange={ onChange }>{ item.name }</MyCheckbox>
                                </div>
                                <div>
                                    <Text>{ item.RUB }₽</Text>
                                    <Text>{ item.RMB }￥</Text>
                                    <Text>{ item.USD }$</Text>
                                </div>
                            </ListParagraph>
                        </List.Item>
                    )}
            />
            <Paragraph>
                <div>Will cost：</div>
                <div>
                    <Text>{ state.list.filter( item => item.complete === false ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.RUB)).toFixed(5)
                    }, 0) }₽</Text>
                    <Text>{ state.list.filter( item => item.complete === false ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.RMB)).toFixed(5)
                    }, 0) }￥</Text>
                    <Text>{ state.list.filter( item => item.complete === false ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.USD)).toFixed(5)
                    }, 0) }$</Text>
                </div>
            </Paragraph>
            <Title>Complete：</Title>
            <MyList
                    bordered
                    dataSource={ state.list.filter( item => item.complete === true ) }
                    renderItem={ item => (
                        <List.Item
                            key={ item.id }
                        >
                            <ListParagraph>
                                <div>
                                    <MyCheckbox checked={ item.complete } value={ item.id } onChange={ onChange }><Complete>{ item.name }</Complete></MyCheckbox>
                                </div>
                                <div>
                                    <Text>{ item.RUB }₽</Text>
                                    <Text>{ item.RMB }￥</Text>
                                    <Text>{ item.USD }$</Text>
                                </div>
                            </ListParagraph>
                        </List.Item>
                    )}
            />
            <Paragraph>
                <div>total：</div>
                <div>
                    <Text>{ state.list.filter( item => item.complete === true ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.RUB)).toFixed(5)
                    }, 0) }₽</Text>
                    <Text>{ state.list.filter( item => item.complete === true ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.RMB)).toFixed(5)
                    }, 0) }￥</Text>
                    <Text>{ state.list.filter( item => item.complete === true ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.USD)).toFixed(5)
                    }, 0) }$</Text>
                </div>
            </Paragraph>
        </>
    );
}

export default Counter