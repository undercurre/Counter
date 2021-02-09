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
    const [task, setTask] = useImmer({
            id: Number(Math.random().toString().substr(3,6) + Date.now()).toString(36),
            name: "",
            price: "",
            currency: null,
            complete: false,
            RMB: 0,
            RUB: 0,
            USD: 0
    });
    const [rate, setRate] = useImmer({
            RUB: 0,
            USD: 0
    });
    const [list, setList] = useImmer([]);

    //method

    async function inList(){
        await setList( draft => {
            draft.push(task);
        });
    }

    function setTaskNull(){
         setTask( draft => {
            draft.id = Number(Math.random().toString().substr(3,6) + Date.now()).toString(36);
            draft.currency = '';
            draft.price = '';
            draft.name = '';
        });
    }

    const add = () => {
        //form-check
        if (!task.name){
            alert("You need to fill name to input-box!");
            return
        }
        if (!task.price){
            alert("You need to fill price to input-box!");
            return
        }
        if (!task.currency){
            alert("You need to choose currency to select-box!");
            return 
        }
        //state manager
        setTask( draft => {
            switch (task.currency) {
                case 'RUB':
                    draft.RUB = Number(task.price).toFixed(5);
                    draft.RMB = (draft.RUB / rate.RUB).toFixed(5);
                    draft.USD = (draft.RMB * rate.USD).toFixed(5);
                    break;

                case 'RMB':
                    draft.RMB = Number(task.price).toFixed(5);
                    draft.RUB = (draft.RMB * rate.RUB).toFixed(5);
                    draft.USD = (draft.RMB * rate.USD).toFixed(5);
                    break;

                case 'USD':
                    draft.USD = Number(task.price).toFixed(5);
                    draft.RMB = (draft.USD / rate.USD).toFixed(5);
                    draft.RUB = (draft.RMB * rate.RUB).toFixed(5);
                    break;

                default:
                    draft.RMB = 0;
                    draft.RUB = 0;
                    draft.USD = 0;
            }
        })
    }

    //select change
    function selectHandleChange(value) {
        setTask( draft => {
            draft["currency"] = value
        });
    }

    //checkbox onChange
    function onChange(e) {
        setList( draft => {
                    var index = draft.findIndex( item => item.id === e.target.value );
                    draft[index].complete = !draft[index].complete;
        });
    }

    //input change
    const inputHandleChange = ( input ) => {
        setTask( draft => {
            draft[input.target.name] = input.target.value;
        });
    };

    useEffect( () => {
        if (task.USD && task.RMB && task.RUB){
            inList().then( () => {
                setTaskNull();
            })
        }
    },[task.USD,task.RMB,task.RUB])

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
        fetchData()
    }, []);

    //render
    return (
        <>
            <Header>
                <MyInput placeholder="task" name="name" value={ task.name } onChange={ inputHandleChange }></MyInput>
                <MyInput placeholder="price" name="price" value={ task.price } onChange={ inputHandleChange }></MyInput>
                <MySelect placeholder="currency" style={{ width: 240 }} value={ task.currency } onChange={ selectHandleChange }>
                    <Option value="RMB">RMB</Option>
                    <Option value="RUB">RUB</Option>
                    <Option value="USD">USD</Option>
                </MySelect>
                <MyButton onClick={ () => add() }>Add</MyButton>
            </Header>
            <Paragraph>
                <div>Exchange rate：</div>
                <div>
                    <Text>{ (rate.RUB).toFixed(5) }₽/￥</Text>
                    <Text>{ (rate.RUB/rate.USD).toFixed(5) }₽/$</Text>
                    <Text>{ (1/rate.USD).toFixed(5) }￥/$</Text>
                </div>
            </Paragraph>
            <Title>Plan：</Title>
            <MyList
                    bordered
                    dataSource={ list.filter( item => item.complete === false ) }
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
                    <Text>{ list.filter( item => item.complete === false ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.RUB)).toFixed(5)
                    }, 0) }₽</Text>
                    <Text>{ list.filter( item => item.complete === false ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.RMB)).toFixed(5)
                    }, 0) }￥</Text>
                    <Text>{ list.filter( item => item.complete === false ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.USD)).toFixed(5)
                    }, 0) }$</Text>
                </div>
            </Paragraph>
            <Title>Complete：</Title>
            <MyList
                    bordered
                    dataSource={ list.filter( item => item.complete === true ) }
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
                    <Text>{ list.filter( item => item.complete === true ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.RUB)).toFixed(5)
                    }, 0) }₽</Text>
                    <Text>{ list.filter( item => item.complete === true ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.RMB)).toFixed(5)
                    }, 0) }￥</Text>
                    <Text>{ list.filter( item => item.complete === true ).reduce((prev, item) => {
                        return (parseFloat(prev) + parseFloat(item.USD)).toFixed(5)
                    }, 0) }$</Text>
                </div>
            </Paragraph>
        </>
    );
}

export default Counter