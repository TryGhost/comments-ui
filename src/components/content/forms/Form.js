import {Transition} from '@headlessui/react';
import {EditorContent} from '@tiptap/react';
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import AppContext from '../../../AppContext';
import {ReactComponent as EditIcon} from '../../../images/icons/edit.svg';
import {ReactComponent as SpinnerIcon} from '../../../images/icons/spinner.svg';
import {Avatar} from '../Avatar';
import {usePopupOpen} from '../../../utils/hooks';

const FormEditor = ({submit, progress, setProgress, close, reduced, isOpen, editor, submitText, submitSize}) => {
    let buttonIcon = null;

    if (progress === 'sending') {
        submitText = null;
        buttonIcon = <SpinnerIcon className="h-[24px] w-[24px] fill-white dark:fill-black" />;
    }

    const stopIfFocused = useCallback((event) => {
        if (editor?.isFocused) {
            event.stopPropagation();
            return;
        }
    }, [editor]);

    const submitForm = useCallback(async () => {
        if (editor.isEmpty) {
            return;
        }

        setProgress('sending');

        try {
            await submit({
                html: editor.getHTML()
            });
        } catch (e) {
            setProgress('error');
            return;
        }

        if (close) {
            close();
        } else {
            // Clear message and blur
            setProgress('sent');
            editor.chain().clearContent().blur().run();
        }
        return false;
    }, [setProgress, editor, submit, close]);

    // Keyboard shortcuts to submit and close/blur the form
    useEffect(() => {
        // Add some basic keyboard shortcuts
        // ESC to blur the editor
        const keyDownListener = (event) => {
            if (event.metaKey || event.ctrlKey) {
                // CMD on MacOS or CTRL

                if (event.key === 'Enter' && editor?.isFocused) {
                    // Try submit
                    submitForm();

                    // Prevent inserting an enter in the editor
                    editor?.commands.blur();
                }

                return;
            }
            if (event.key === 'Escape') {
                if (editor?.isFocused) {
                    if (close) {
                        close();
                    } else {
                        editor?.commands.blur();
                    }
                }
                return;
            }
        };

        // Note: normally we would need to attach this listener to the window + the iframe window. But we made listener
        // in the Iframe component that passes down all the keydown events to the main window to prevent that
        window.addEventListener('keydown', keyDownListener, {passive: true});

        return () => {
            window.removeEventListener('keydown', keyDownListener, {passive: true});
        };
    }, [editor, close, submitForm]);

    return (
        <div className={`relative w-full pl-[52px] transition-[padding] delay-100 duration-150 ${reduced && 'pl-0'} ${isOpen && 'pl-[1px] pt-[64px] sm:pl-[52px]'}`}>
            <div
                className={`w-full rounded-md border border-none border-slate-50 bg-[rgba(255,255,255,0.9)] px-3 py-4 font-sans text-[16.5px] leading-normal shadow-form transition-all delay-100 duration-150 hover:shadow-formxl focus:outline-0 dark:border-none dark:bg-[rgba(255,255,255,0.08)] dark:text-neutral-300 dark:shadow-transparent ${isOpen ? 'min-h-[144px] cursor-text pb-[68px] pt-2' : 'min-h-[48px] cursor-pointer overflow-hidden hover:border-slate-300'}
            `}>
                <EditorContent
                    onMouseDown={stopIfFocused} onTouchStart={stopIfFocused}
                    editor={editor}
                />
            </div>
            <div className="absolute bottom-[9px] right-[9px] flex space-x-4 transition-[opacity] duration-150">
                {close &&
                    <button type="button" onClick={close} className="ml-2.5 font-sans text-sm font-medium text-neutral-500 outline-0 dark:text-neutral-400">Cancel</button>
                }
                <button
                    className={`flex w-auto items-center justify-center sm:w-[128px] ${submitSize === 'medium' && 'sm:w-[100px]'} ${submitSize === 'small' && 'sm:w-[64px]'} h-[39px] rounded-[6px] border bg-neutral-900 px-3 py-2 text-center font-sans text-sm font-semibold text-white outline-0 transition-[opacity] duration-150 dark:bg-[rgba(255,255,255,0.9)] dark:text-neutral-800`}
                    type="button"
                    data-testid="submit-form-button"
                    onClick={submitForm}
                >
                    <span>{buttonIcon}</span>
                    {submitText && <span>{submitText}</span>}
                </button>
            </div>
        </div>
    );
};

const FormHeader = ({show, name, expertise, editName, editExpertise}) => {
    return (
        <Transition
            show={show}
            enter="transition duration-500 delay-100 ease-in-out"
            enterFrom="opacity-0 -translate-x-2"
            enterTo="opacity-100 translate-x-0"
            leave="transition-none duration-0"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div
                className="font-sans text-[17px] font-bold tracking-tight text-[rgb(23,23,23)] dark:text-[rgba(255,255,255,0.85)]"
                onClick={editName}
                data-testid="member-name"
            >
                {name ? name : 'Anonymous'}
            </div>
            <div className="flex items-baseline justify-start">
                <button
                    type="button"
                    className={`group flex max-w-[80%] items-center justify-start whitespace-nowrap text-left font-sans text-[14px] tracking-tight text-[rgba(0,0,0,0.5)] transition duration-150 hover:text-[rgba(0,0,0,0.75)] dark:text-[rgba(255,255,255,0.5)] dark:hover:text-[rgba(255,255,255,0.4)] sm:max-w-[90%] ${!expertise && 'text-[rgba(0,0,0,0.3)] hover:text-[rgba(0,0,0,0.5)] dark:text-[rgba(255,255,255,0.3)]'}`}
                    onClick={editExpertise}
                >
                    <span className="... overflow-hidden text-ellipsis">{expertise ? expertise : 'Add your expertise'}</span>
                    {expertise && <EditIcon className="ml-1 h-[12px] w-[12px] -translate-x-[6px] stroke-[rgba(0,0,0,0.5)] opacity-0 transition-all duration-100 ease-out group-hover:translate-x-0 group-hover:stroke-[rgba(0,0,0,0.75)] group-hover:opacity-100 dark:stroke-[rgba(255,255,255,0.5)] dark:group-hover:stroke-[rgba(255,255,255,0.3)]" />}
                </button>
            </div>
        </Transition>
    );
};

const Form = ({comment, submit, submitText, submitSize, close, editor, reduced, isOpen}) => {
    const {member, dispatchAction} = useContext(AppContext);
    const isAskingDetails = usePopupOpen('addDetailsPopup');
    const [progress, setProgress] = useState('default');
    const formEl = useRef(null);

    const memberName = member?.name ?? comment?.member?.name;
    const memberExpertise = member?.expertise ?? comment?.member?.expertise;

    if (progress === 'sending' || (memberName && isAskingDetails)) {
        // Force open
        isOpen = true;
    }

    const preventIfFocused = (event) => {
        if (editor?.isFocused) {
            event.preventDefault();
            return;
        }
    };

    const openEditDetails = useCallback((options) => {
        editor?.commands?.blur();

        dispatchAction('openPopup', {
            type: 'addDetailsPopup',
            expertiseAutofocus: options.expertiseAutofocus ?? false,
            // WIP
            callback: function (succeeded) {
                if (!editor || !formEl.current) {
                    return;
                }

                // Don't use focusEditor to avoid loop
                if (!succeeded) {
                    return;
                }

                // useEffect is not fast enought to enable it
                editor.setEditable(true);
                editor.commands.focus();
            }
        });
    }, [editor, dispatchAction, formEl]);

    const editName = useCallback(() => {
        openEditDetails({expertiseAutofocus: false});
    }, [openEditDetails]);

    const editExpertise = useCallback(() => {
        openEditDetails({expertiseAutofocus: true});
    }, [openEditDetails]);

    const focusEditor = useCallback(() => {
        if (editor.isFocused) {
            return;
        }

        // Force to input a name first
        if (!memberName) {
            editName();
            return;
        }

        editor.commands.focus();
    }, [editor, editName, memberName]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        // Disable editing if the member doesn't have a name or when we are submitting the form
        editor.setEditable(!!memberName && progress !== 'sending');
    }, [editor, memberName, progress]);

    return (
        <form ref={formEl} data-testid="form" onClick={focusEditor} onMouseDown={preventIfFocused} onTouchStart={preventIfFocused} className={`-mx-3 -mt-[10px] mb-10 rounded-md px-3 pb-2 pt-3 transition duration-200 ${isOpen ? 'cursor-default' : 'cursor-pointer'} ${reduced && 'pl-1'}
        `}>
            <div className="relative w-full">
                <div className="pr-[1px] font-sans leading-normal dark:text-neutral-300">
                    <FormEditor close={close} reduced={reduced} isOpen={isOpen} editor={editor} submitText={submitText} submitSize={submitSize} submit={submit} setProgress={setProgress} progress={progress} />
                </div>
                <div className='absolute left-0 top-1 flex h-12 w-full items-center justify-start'>
                    <div className="mr-3 grow-0">
                        <Avatar comment={comment} className="pointer-events-none" />
                    </div>
                    <div className="grow-1 w-full">
                        <FormHeader show={isOpen} name={memberName} expertise={memberExpertise} editExpertise={editExpertise} editName={editName} />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default Form;
