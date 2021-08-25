import axios from 'axios'
import {convertObjectToArray} from '../../utils/utils'
const KEY = 'AIzaSyB7dKEaTf00MBiwAlkx9R5tjIhr9txA_2E'

export const signUp = user => async (dispatch, getState) => {
  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${KEY}`, {
      ...user,
      returnSecureToken: true
    })
    const betAmount = await axios.put(`https://betapp-54dbf.firebaseio.com/balance/${response.data.localId}.json`, {
      betAmount: 1500
    })
    // console.log(response.data)
    localStorage.setItem('refresh', response.data.refreshToken)
    dispatch({
      type: 'SIGN_UP',
      payload: response.data
    })
    dispatch({
      type: 'BET_AMOUNT',
      payload: betAmount.data.betAmount
    })
  } catch (err) {
    throw new Error(err)
  }
}

export const signIn = user => async (dispatch, getState) => {
  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`, {
      ...user,
      returnSecureToken: true
    })
    // console.log("the SIGNIN data is: ", response.data)
    const betAmount = await axios.get(`https://betapp-54dbf.firebaseio.com/balance/${response.data.localId}.json`)
    // console.log("The returned betAmount is: ", betAmount)
    dispatch({
      type: 'BET_AMOUNT',
      payload: betAmount.data.betAmount
    })
    const {data} = await axios.get(`https://betapp-54dbf.firebaseio.com/betlist/${response.data.localId}.json`)
    dispatch({
      type: 'FETCH_BETS',
      payload: convertObjectToArray(data)
    })
    localStorage.setItem('refresh', response.data.refreshToken)
    dispatch({
      type: 'SIGN_IN',
      payload: response.data
    })
  } catch (err) {
    throw new Error(err)
  }
}

export const refreshToken = user => async (dispatch, getState) => {
  // console.log(email, password)
  try {
    const refreshToken = localStorage.getItem('refresh')
    if (refreshToken) {
      const {data} = await axios.post(`https://securetoken.googleapis.com/v1/token?key=${KEY}`, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
      const currentUser = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${KEY}`, {
        idToken: data.id_token
      })
      const betAmount = await axios.get(`https://betapp-54dbf.firebaseio.com/balance/${currentUser.data.users[0].localId}.json`)
      localStorage.setItem('refresh', data.refresh_token)
      dispatch({
        type: 'BET_AMOUNT',
        payload: betAmount.data.betAmount
      })
      dispatch({
        type: 'SIGN_IN',
        payload: {
          idToken: data.id_token,
          refreshToken: data.refresh_token,
          email: currentUser.data.users[0].email,
          localId: currentUser.data.users[0].localId,
          expiresIn: data.expires_in
        }
      })
      dispatch({
        type: 'APP_LOAD',
        payload: true
      })
    }
    dispatch({
      type: 'APP_LOAD',
      payload: true
    })
  } catch (err) {
    dispatch({
      type: 'APP_LOAD',
      payload: true
    })
  }
}

export const signOut = () => (dispatch, getState) => {
  localStorage.removeItem('refresh')
  dispatch({
    type: 'SIGN_OUT'
  })
  dispatch({
    type: 'FETCH_BETS',
    payload: []
  })
}

export const makePayment = user => async (dispatch, getState) => {
  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${KEY}`, {
      ...user,
      returnSecureToken: true
    })
    const betAmount = await axios.put(`https://betapp-54dbf.firebaseio.com/balance/${response.data.localId}.json`, {
      betAmount: 1500
    })
    dispatch({
      type: 'BET_AMOUNT',
      payload: betAmount.data.betAmount
    })
  } catch (err) {
    throw new Error(err)
  }
}

export const updateBetAmount = newBetAmount => async (dispatch, getState) => {
  try {
    const betAmount = await axios.put(`https://betapp-54dbf.firebaseio.com/balance/${getState().authUser.localId}.json`, {
      betAmount: newBetAmount
    })
    dispatch({
      type: 'BET_AMOUNT',
      payload: betAmount.data.betAmount
    })
  } catch (err) {
    throw new Error(err)
  }
}
