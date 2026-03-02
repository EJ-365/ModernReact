import {useNavigate, useParams} from "react-router-dom";
import {playersData} from "../playersData";

function Profile() {
    const navigate = useNavigate();

    const {id} = useParams();
    const players = playersData.find(p => p.id === id);
    if (! players) 
        return <h1>Couldn't find the player</h1>

    // rediret back to players page
   
    function redirectToPLayersPage(){
        navigate("/players")
    }

    return (
        <div> {/* player name and back to player button */}
            <div className="p-4 mx-3 flex items-center justify-between">
                <h1 className="text-4xl font-extrabold capitalize">Player Profile: {
                    players.name
                }</h1>
                <button className="text-[14px] font-semibold bg-orange-600 py-2.5 px-6 rounded-md text-white uppercase cursor-pointer hover:bg-orange-600/90 duration-300 transition-all ease-in-out" onClick={redirectToPLayersPage}>
                    <i className="bx bx-arrow-left items-center align-middle font-extralight text-2xl mr-1.5 "/>Back to players</button>
            </div>

            {/* Players individual cards start here */} 
            <div>TBD: Players individual card</div>

            </div>
    )
}
export default Profile;
