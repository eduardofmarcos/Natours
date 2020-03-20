import axios from 'axios';
import { showAlert } from './alerts';

//type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3001/api/v1/users/updatepassword'
        : 'http://localhost:3001/api/v1/users/updateme';
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    console.log(data);

    if (res.data.status === 'success') {
      //alert('Logged in successfully!');
      showAlert('success', 'updated!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
