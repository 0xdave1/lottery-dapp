import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import constants from './constants';

function PickWinner() {
    const [setOwner] = useState('');
    const [contractInstance, setContractInstance] = useState(null);
    const [currentAccount, setCurrentAccount] = useState('');
    const [isOwnerConnected, setIsOwnerConnected] = useState(false);
    const [winner] = useState('');
    const [status, setStatus] = useState(false);

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new BrowserProvider(window.ethereum);
                try {
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    console.log(address);
                    setCurrentAccount(address);
                    window.ethereum.on('accountsChanged', (accounts) => {
                        setCurrentAccount(accounts[0]);
                        console.log(currentAccount);
                    });
                } catch (err) {
                    if (err.code === -32002) {
                        alert('Please check MetaMask for pending requests.');
                    } else {
                        console.error(err);
                    }
                }
            } else {
                alert('Please install Metamask to use this application');
            }
        };

        const contract = async () => {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractIns = new Contract(constants.contractAddress, constants.contractAbi, signer);
            setContractInstance(contractIns);
            try {
                const participants = await contractIns.getParticipants();
                setStatus(participants.includes(currentAccount));
            } catch (err) {
                console.error('Error fetching participants:', err);
            }
            try {
                const owner = await contractIns.manager();
                setOwner(owner);
                if (owner === currentAccount) {
                    setIsOwnerConnected(true);
                } else {
                    setIsOwnerConnected(false);
                }
            } catch (err) {
                console.error('Error fetching manager:', err);
            }
        };

        loadBlockchainData();
        contract();
    }, [currentAccount]);

    const pickWinner = async () => {
        try {
            const tx = await contractInstance.pickWinner();
            await tx.wait();
        } catch (err) {
            console.error('Error picking winner:', err);
        }
    };

    return (
        <div className='container'>
            <h1>Result Page</h1>
            <div className='button-container'>
                {status ? (
                    <p>Lottery Winner is: {winner}</p>
                ) : (
                    isOwnerConnected ? (
                        <button className="enter-button" onClick={pickWinner}> Pick Winner </button>
                    ) : (
                        <p>You are not the owner</p>
                    )
                )}
            </div>
        </div>
    );
}

export default PickWinner;
