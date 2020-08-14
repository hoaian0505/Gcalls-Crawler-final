import axios from 'axios';
const normalize = require('normalize-text').normalizeWhitespaces;
import {getLink,getField,getLastPage,getLastField} from './get';
var x='';

export const getAllData = (i,n) => async dispatch => {
    console.log('Dang luu toi trang thu = ',i);
    var TempUrl='/getlink/'+i;
    axios.get(TempUrl)
    .then(res => dispatch(saveDataCompany(res.data) ))
    .then(()=>
      {
        if (i<n){
          dispatch(getAllData(i+1,n));
      }
      else{
        alert('Da load xong toan bo database');
      }})
    .catch(error => console.log(error))
  }
  
  export const saveDataCompany = (obj) => async dispatch => { 
    await axios.post('/company',obj)
  }
  
  export const saveData = (event) => async dispatch => {
    //console.log('TONG TRANG ====== ',event);
    if (event>0){
      console.log('TONG TRANG = ',event);
      dispatch(getAllData(1,event));
      dispatch({
        type:'SAVE_DATA',
        payload:{
          isAdded:false
        }
      })
    }
  }

  export const saveLink = () => async dispatch => {
    x=normalize(document.getElementById('linkInput').value);
    x=x.substring(0,x.indexOf(".html"));
    x=x.replace(/ /g,'');
    if (x!=""){
      var z='/';
      var k=new RegExp(z,'gi');
      var y=x.replace(k,'`');
      var Temp = '/field/link/'+y;
      axios.get(Temp)
      .then(res =>
        {
          if (res.data==false){
          //console.log('STEP 1!!');
          axios.post('/field',{link:x})
          //.then(() => console.log('STEP 2!!'))
          .then(() => dispatch({
                              type: 'SAVE_LINK',
                              payload:{
                                isLoaded:true,
                                items:[]
                              }
                            }))
          //.then(() => console.log('STEP 3!!'))
          .then(() => dispatch(getLink()))
          //.then(() => console.log('STEP 4!!'))
          .then(() => dispatch(getField()))
          //.then(() => console.log('STEP 5!!'))
          .then(() => dispatch(getLastPage()))
          //.then(() => console.log('STEP 6!!'))
          .then(()=> document.getElementById('linkInput').value='')
          .then(()=> dispatch(getLastField()))
          .catch(error => console.log(error));
        }
        else{
          alert('Thong tin can lay da duoc lay tu truoc!');
      }})
      .catch(error => console.log(error));
    }
    else{
      alert('Vui long nhap du thong tin');
    }
  }