import React, {useContext} from 'react';
import {Transition} from '@headlessui/react';
import Frame from '../Frame';
import AppContext from '../../AppContext';

const GenericDialog = (props) => {
    // The modal will cover the whole screen, so while it is hidden, we need to disable pointer events
    const {dispatchAction} = useContext(AppContext);

    const close = (event) => {
        dispatchAction('closePopup');
    };

    const stopPropagation = (event) => {
        event.stopPropagation();
    };

    return (
        <Transition show={props.show} appear={true}>
            <Frame type="fixed">
                <div>
                    <Transition.Child
                        enter="transition duration-200 linear"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition duration-200 linear"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed top-0 left-0 overflow-hidden w-screen h-screen flex pt-0 sm:pt-12 justify-center bg-gradient-to-b from-[rgba(0,0,0,0.2)] to-rgba(0,0,0,0.1) backdrop-blur-[2px]" onClick={close}>
                            <Transition.Child
                                enter="transition duration-200 delay-150 linear"
                                enterFrom="translate-y-4 opacity-0"
                                enterTo="translate-y-0 opacity-100"
                                leave="transition duration-200 linear"
                                leaveFrom="translate-y-0 opacity-100"
                                leaveTo="translate-y-4 opacity-0"
                            >
                                <div className="relative bg-white w-screen sm:w-[500px] h-screen sm:h-auto p-[28px] sm:p-8 rounded-none sm:rounded-xl text-center shadow-modal" onClick={stopPropagation}>
                                    {props.children}
                                </div>
                            </Transition.Child>
                        </div>
                    </Transition.Child>
                </div>
            </Frame>
        </Transition>
    );
};

export default GenericDialog;
