import React, {useContext, useState} from 'react';
import {ReactComponent as SpinnerIcon} from '../../images/icons/spinner.svg';
import {ReactComponent as SuccessIcon} from '../../images/icons/success.svg';
import CloseButton from './CloseButton';
import AppContext from '../../AppContext';

const ReportPopup = (props) => {
    const {dispatchAction} = useContext(AppContext);
    const [progress, setProgress] = useState('default');

    let buttonColor = 'bg-red-600';
    if (progress === 'sent') {
        buttonColor = 'bg-green-600';
    }

    let buttonText = 'Report this comment';
    if (progress === 'sending') {
        buttonText = 'Sending';
    } else if (progress === 'sent') {
        buttonText = 'Sent';
    }

    let buttonIcon = null;
    if (progress === 'sending') {
        buttonIcon = <SpinnerIcon className="mr-2 h-[24px] w-[24px] fill-white" />;
    } else if (progress === 'sent') {
        buttonIcon = <SuccessIcon className="mr-2 h-[16px] w-[16px]" />;
    }

    const stopPropagation = (event) => {
        event.stopPropagation();
    };

    const close = (event) => {
        dispatchAction('closePopup');
    };

    const submit = (event) => {
        event.stopPropagation();

        setProgress('sending');

        // purposely faking the timing of the report being sent for user feedback purposes
        setTimeout(() => {
            setProgress('sent');
            dispatchAction('reportComment', props.comment);

            setTimeout(() => {
                close();
            }, 750);
        }, 1000);
    };

    return (
        <div className="rounded-none relative h-screen w-screen bg-white p-[28px] text-center shadow-modal sm:h-auto sm:w-[500px] sm:rounded-xl sm:p-8 sm:text-left" onMouseDown={stopPropagation}>
            <h1 className="mb-1 font-sans text-[24px] font-bold tracking-tight text-black">You want to report<span className="hidden sm:inline"> this comment</span>?</h1>
            <p className="text-base px-4 font-sans leading-9 text-neutral-500 sm:pr-4 sm:pl-0">Your request will be sent to the owner of this site.</p>
            <div className="mt-10 flex flex-col items-center justify-start gap-4 sm:flex-row">
                <button
                    className={`flex h-[44px] w-full items-center justify-center rounded-md px-4 font-sans text-[15px] font-semibold text-white transition duration-200 ease-linear sm:w-[200px] ${buttonColor} opacity-100 hover:opacity-90`}
                    onClick={submit}
                    style={{backgroundColor: buttonColor ?? '#000000'}}
                >
                    {buttonIcon}{buttonText}
                </button>
                <button type="button" onClick={close} className="font-sans text-sm font-medium text-neutral-500 dark:text-neutral-400">Cancel</button>
            </div>
            <CloseButton close={() => close(false)} />
        </div>
    );
};

export default ReportPopup;
