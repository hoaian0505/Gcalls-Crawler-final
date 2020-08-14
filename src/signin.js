import React from 'react';
import { connect } from 'react-redux';
import {getUser} from './actions/get';
import './Style.css';
import axios from 'axios';

class Signin extends React.Component {
    constructor(props) {
        super(props); 
    }
    
    checkUserPassword(){
        const {appData} = this.props;
        var user = document.getElementById('inputUser').value;
        var password = document.getElementById('inputPassword').value;
        if ((user == appData.User) &&
            (password == appData.Password))
        {
            // localStorage.setItem('loggedIn',true);
            this.LoggedIn();
            //this.props.history.push("/app/home");
        }
        else
        {
            alert('Wrong User or Password, please try again!!');
        }
    }

    LoggedIn(){
      this.props.history.push("/login");
      window.location.reload(true);
    }

    getSession(){
      var temp = false;
      axios.get('/islogged')
      .then(res => temp=Boolean(res.data))
      .then(() => 
        {if (temp==true){
          this.LoggedIn();
        }})
      .catch(error => console.log(error));
    }

    componentDidMount() {
        const {getUser} = this.props;
        this.getSession();
        getUser();
    }

    render() {
        return (
          <div className="container-fluid">
            <header className="Tittle">SIGN IN</header>
            <form className="form-horizontal">
              <div className="form-group">
                <label className="col-sm-2 control-label"> User name</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control"  id="inputUser" placeholder="User Name" required autoFocus />
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-2 control-label"> Password</label>
                <div className="col-sm-10">
                  <input type="password" className="form-control" id="inputPassword" placeholder="Password" required />
                </div>
              </div> 
              <div className="form-group">
                <div className="col-sm-offset-2 col-sm-10">
                  <button type="submit" className="btn btn-default" onClick={this.checkUserPassword.bind(this)}>Sign in</button>
                </div>
              </div>  
            </form>
          </div>
        )
    }
}

function mapStateToProps (state) {
    return {
      appData: state.appData
    }
  }

  function mapDispatchToProps (dispatch) {
    return {
      getUser: () => dispatch(getUser())
    }
  }

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(Signin)