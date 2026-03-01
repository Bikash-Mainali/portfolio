import {Outlet} from "react-router";
import {useNavigate} from "react-router";
import {AuthenticationEnum} from "../util/AuthenticationEnum.js";

const AdminLayout = () => {
    const navigate = useNavigate();
    if (!localStorage.getItem(AuthenticationEnum.ACCESS_TOKEN)) {
        debugger
        navigate('/home');
        return null;
    }

    return (
        <Outlet/>
    )
}

export default AdminLayout