import React from "react";
import uuid from 'react-uuid'

export const BountyCard = ({ bounty }) => {
    const percentComplete = Math.round(bounty.overallProgress * 100 );
    return (
        <div style={{ position: 'relative', marginBottom: '1em' }}>
            <img style={{ height: '50%', top: '25%', position: 'absolute', right: 0 }}src={'https://www.bungie.net' + bounty.icon} />
            <div style={{ width: '80%' }}>
                <div style={{ display: 'inline-block'}}>
                    {bounty.name}
                    {/* ({bounty.itemType === 12 ? "Quest Step" : "Bounty"}) */}
                </div>
                <div style={{ marginTop: "0.5em", overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} >
                    {bounty.description}
                </div>
                <div style={{ marginTop: "0.5em", minWidth: '110px', width: (percentComplete + '%'), background: "#333", padding: "0.25em"}}>
                    {percentComplete}% Complete
                </div>
                <div style={{ marginTop: "0.5em" }}>
                    {bounty.relevantKeys.map((key) => <span key={uuid()} style={{ background: "#ccc", color: "#333", padding: "0.25em", marginRight: "0.25em" }}>{key.split('_').join(' ')}</span>)}
                </div>
            </div>
        </div>
    );
}