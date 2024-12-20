import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseEther } from 'ethers'; // Importing parseEther directly
import constants from './constants';

function Home() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [contractInstance, setContractInstance] = useState(null);
    const [status, setStatus] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [amount, setAmount] = useState("");

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
        };

        loadBlockchainData();
        contract();
    }, [currentAccount, contractInstance]);

    const enterLottery = async () => {
        const amountToSend = parseEther(amount); // Correct usage of parseEther
        const tx = await contractInstance.enter({ value: amountToSend });
        await tx.wait();
    };

    const claimPrize = async () => {
        try {
            const tx = await contractInstance.pickWinner();
            await tx.wait();
        } catch (err) {
            console.error('Error claiming prize:', err);
        }
    };

    return (
        <div className="container">
            <h1>Lottery Page</h1>
            <div className="input-container">
                <input 
                    type="text" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount in ETH"
                />
                <button className="enter-button" onClick={enterLottery} disabled={!amount}>
                    Enter Lottery
                </button>
            </div>
            <div className="button-container">
                {status ? (
                    isWinner ? (
                        <button className="enter-button" onClick={claimPrize}> Claim Prize </button>
                    ) : (
                        <p>You are not the winner</p>
                    )
                ) : (
                    <p>Enter an amount to join the lottery</p>
                )}
            </div>
        </div>
    );
}

export default Home;

