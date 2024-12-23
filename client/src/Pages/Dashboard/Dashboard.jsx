
import { useLocation, } from "react-router-dom"
import DashProfile from "./DashProfile";
import {DashSidebar} from "./DashSidebar";
import DashPosts from "./DashPosts";
import DashUsers from "./DashUsers";
import {  useEffect, useState } from "react";
const Dashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState('');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
        if(tabFromUrl){
          setTab(tabFromUrl);}
  }, [location.search]);


  return (
    <div className="min-h-screen flex md:flex-row  flex-col ">
      {/* sidebar*/}
      <div>
        <DashSidebar />
      </div>
      {/* profile */}
      {tab==='profile' && <DashProfile />}
      {/* posts */}
      {tab==='posts' && <DashPosts />}
      {/* users */}
      {tab==='users' && <DashUsers />}

    </div>
  );
}

export default Dashboard;
