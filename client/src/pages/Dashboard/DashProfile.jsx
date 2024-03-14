import { TextInput } from "flowbite-react";
import { useSelector } from "react-redux";
import {Button} from  'flowbite-react';
import { useState , useRef, useEffect} from "react";
import {app}  from  "../../firebase"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {  getDownloadURL,   getStorage, ref,  uploadBytesResumable} from 'firebase/storage';
import {Alert} from "flowbite-react";
//import { object } from "prop-types";
import { updateStart,updateSuccess, updateFail } from "../../redux/user/userSlice";
import { useDispatch } from "react-redux";

    const DashProfile = () => {
    const {currentUser} = useSelector((state)=>state.user);
    const [imageFile, setImageFile] = useState(null);
    const[imageFileUploading, setImageFileUploading]=useState(false);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] =useState(0);
    const [imageFileUploadError, setImageFileUploadError] =useState(null);
    const[formData, setFormData]=useState({});
    const filePickerRef = useRef();
    const dispatch = useDispatch();

    const changeHandler = (e) => {
      setFormData({...formData, [e.target.id]: e.target.value});
    };
  
    const imageChangeHandler = (e) => {
      const file = e.target.files[0];
      if(file){
        setImageFile(file);
        setImageFileUrl ( URL.createObjectURL(file));
        
      }
    };
    useEffect(() => {
      if(imageFile){
        uploadImage();
        }
    }, [imageFile]);   

    
    const uploadImage = async () => {
      // service firebase.storage {
      //   match /b/{bucket}/o {
      //     match /{allPaths=**} {
      //       allow read;
      //       allow write: if request.resource.size< 2*1024*1024 && 
      //       request.resource.contentType.matches('image/.*')
      //     }
      //   }
      // }
      setImageFileUploading(true);
      setImageFileUploadError(null);
      const storage= getStorage(app)
      const fileName= new  Date().getTime() + imageFile.name;
      const storageRef= ref(storage, fileName);
      const uploadTask= uploadBytesResumable(storageRef, imageFile)
      uploadTask.on(
        'state_changed', 
        (snapshot)=>{
          const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
              setImageFileUploadProgress(progress.toFixed(0));

        }

      ),
            (error) =>{
        setImageFileUploadError("image could not upload , file muse be less than 2mb", error);

        setImageFile(null);
        setImageFileUploadProgress(null);
        setImageFileUrl(null);
        setImageFileUploading(false);

      }
      ,
      ()=>{

        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
        setImageFileUrl(downloadURL);
        console.log('downloadURL', downloadURL);
        setFormData({...formData, profilePicture: downloadURL});
        setImageFileUploading(false);
        })

      }

    };
    
    const handleSubmit = async (e) => {
      console.log('formData of the user', formData);
      console.log('currentUerId in the update class', currentUser._id);
      e.preventDefault();
      
      if( Object.keys(formData).length === 0){
        console.log('No changes were made');
        return;

      }

    // Wait for the image upload to complete
  if (imageFileUploading) {
    console.log('Please wait for the image upload to complete');
    return;
  }
    
           try {
            dispatch(updateStart())
            console.log('formData of the user in the try and', formData);
            
            const res= await fetch(`/api/user/update/${currentUser._id}`,{
                method: 'PUT',
                headers:{
                  'Content-Type':'application/json',
                },
                body:JSON.stringify(formData)});
      
                if (res.ok){
                
                  const data = await res.json();
                  dispatch(updateSuccess(data));
                }
                
                else{
                  let errorMessage = 'An error occurred';
                  if (res.headers.get('Content-Type').includes('application/json')) {
                    const errorData = await res.json();
                    errorMessage = errorData.message;
                  }
                  dispatch(updateFail(errorMessage));

                }
            
              
            }

            
           
           catch (error) {
            dispatch(updateFail(error.message));
            console.log("updateFail", dispatch(updateFail(error.message))  );
           }

          
          

          
    };
    


    return(
    <div className="max-w-lg mx-auto p-3 w-full">
        <h1 className="text-center p-5 font-semibold text-[24px]">Profile</h1>
      <form className="flex flex-col gap-2" 
      onSubmit={handleSubmit}>
        <input type="file"  
        accept='image/*' onChange={imageChangeHandler} 
        ref={filePickerRef}
        hidden />
        <div className=" relative w-32 h-32 self-center cursor-pointer shadow-md
        rounded-full overflow-hidden " 
        onClick={()=> filePickerRef.current.click()}>
          {imageFileUploadProgress &&
           (<CircularProgressbar 
          value={imageFileUploadProgress|| 0} 
          text={`${imageFileUploadProgress}%`}
          strokeWidth={5}
          styles= {{
                root:{
                  height:'100%',
                  width:'100%',
                  position:'absolute',
                  top:0,
                  left:0
                },
                path:{
                  stroke:`rgba(67, 150, 250, ${imageFileUploadProgress/100})`,
                  
                },
          }}
          />) }  
        <img 
        src={imageFileUrl || currentUser.profilePicture} alt="user"  
        className={`rounded-full  w-full h-full border-8   border-gray-300
        object-cover 
        ${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60 '}`} />
        
        </div>
        {imageFileUploadError &&
         <Alert Alert className="text-red-500">{imageFileUploadError}</Alert>}
        <TextInput 
        type="text" 
        id="username" 
        defaultValue={currentUser.username} 
        placeholder="username"
        onChange={changeHandler}
        />
        <TextInput 
        type="email"
         id="email" 
         defaultValue={currentUser.email}
          placeholder="email"
          onChange={changeHandler}
          />
        <TextInput 
        type="password" 
         placeholder="password"
         id='password'
         onChange={changeHandler}
         />
        <Button type='submit' outline>
          <p className="text-[20px]">Update</p>

        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span className="cursor-pointer"> Delate Account</span>
        <span className="cursor-pointer"> Sign out</span>
      </div>

    </div>
            )
}

export default DashProfile;