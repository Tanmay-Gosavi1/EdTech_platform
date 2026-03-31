import React, {useEffect, useContext, useCallback, useRef} from 'react'
import {useSearchParams} from 'react-router-dom'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import {AppContext} from '../../context/AppContext.jsx'

const VerifyPayment = () => {

    const {navigate, backendUrl, token, fetchUserEnrolledCourses} = useContext(AppContext);
    const [searchParams]= useSearchParams();
    const hasVerifiedRef = useRef(false);

    const success= searchParams.get('success');
    const purchaseId= searchParams.get('purchaseId');

    const verifyPayment= useCallback(async ()=>{
        try{
            const response= await axios.post(backendUrl + '/api/user/verify-payment',{success, purchaseId},{
                headers: {Authorization: `Bearer ${token}`}
            })
            if(response.data.success){
                if(success === 'true'){
                    await fetchUserEnrolledCourses();
                    navigate('/my-enrollments', {
                        replace: true,
                        state: { toast: { type: 'success', message: response.data.message || 'Payment verified successfully' } },
                    });
                    return;
                }
                navigate('/course-list', {
                    replace: true,
                    state: { toast: { type: 'error', message: response.data.message || 'Payment failed or cancelled' } },
                });
            }else{
                navigate('/course-list', {
                    replace: true,
                    state: { toast: { type: 'error', message: response.data.message || 'Payment verification failed' } },
                });
            }
        }catch(error){
            navigate('/course-list', {
                replace: true,
                state: { toast: { type: 'error', message: error.response?.data?.message || error.message } },
            });
        }
    }, [backendUrl, fetchUserEnrolledCourses, navigate, purchaseId, success, token])

    useEffect(()=>{
        if(!purchaseId){
            navigate('/course-list', {
                replace: true,
                state: { toast: { type: 'error', message: 'Invalid payment callback.' } },
            });
            return;
        }

        if(!token){
            navigate('/login', {
                replace: true,
                state: { toast: { type: 'info', message: 'Please login to complete payment verification.' } },
            });
            return;
        }

        if(!hasVerifiedRef.current){
            hasVerifiedRef.current = true;
            verifyPayment();
        }
    },[navigate, purchaseId, token, verifyPayment])

  return (
    <div>
      <h2>Verifying payment...</h2>
      <Loading />
    </div>
  )
}

export default VerifyPayment