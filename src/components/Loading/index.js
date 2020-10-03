import React from 'react';
import {
    CircularProgress
} from "@material-ui/core";

export default function Loading() {
    return(
        <div style={{position : "absolute", top:0, bottom: 0, left: 0, right: 0, width: "100vw", height:"100vh", backgroundColor: "white", display:"flex", alignItems:"center", justifyContent:"center"}}>
            <CircularProgress />
        </div>
    )
}