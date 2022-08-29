import React, {useContext} from 'react';
import AppContext from '../AppContext';
import {getInitials} from '../utils/helpers';
import {ReactComponent as AvatarIcon} from '../images/icons/avatar.svg';

const Avatar = ({comment, size, isBlank}) => {
    const {member, avatarSaturation} = useContext(AppContext);
    const dimensionClasses = (size === 'small' ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-9 h-9 sm:w-[40px] sm:h-[40px]');

    // When an avatar has been deleted or hidden
    // todo: move to seperate component
    if (isBlank) {
        return (
            <figure className={`relative ${dimensionClasses}`}>
                <div className={`flex justify-center items-center rounded-full bg-neutral-200 bg-[rgba(200,200,200,0.3)] ${dimensionClasses}`}>
                    <AvatarIcon className="stroke-white dark:opacity-70" />
                </div>
            </figure>
        );
    }

    const memberName = member?.name ?? comment?.member?.name;

    const getHashOfString = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        return hash;
    };

    const normalizeHash = (hash, min, max) => {
        return Math.floor((hash % (max - min)) + min);
    };

    const generateHSL = () => {
        let commentMember = (comment ? comment.member : member);

        if (!commentMember || !commentMember.name) {
            return [0,0,10];
        }

        const saturation = isNaN(avatarSaturation) ? 50 : avatarSaturation;

        const hRange = [0, 360];
        const lRangeTop = Math.round(saturation / (100 / 30)) + 30;
        const lRangeBottom = lRangeTop - 20;
        const lRange = [lRangeBottom, lRangeTop];

        const hash = getHashOfString(commentMember.name);
        const h = normalizeHash(hash, hRange[0], hRange[1]);
        const l = normalizeHash(hash, lRange[0], lRange[1]);
        
        return [h, saturation, l];
    };

    const HSLtoString = (hsl) => {
        return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
    };

    const commentGetInitials = () => {
        if (comment && !comment.member) {
            return getInitials('Deleted member');
        }
        
        let commentMember = (comment ? comment.member : member);

        if (!commentMember || !commentMember.name) {
            return getInitials('Anonymous');
        }
        return getInitials(commentMember.name);
    };

    let initialsClasses = (size === 'small' ? 'text-sm' : 'text-lg');
    let commentMember = (comment ? comment.member : member);

    const bgColor = HSLtoString(generateHSL());
    const avatarStyle = {
        background: bgColor
    };

    let avatarEl = (
        <>
            {memberName ?
                (<div className={`flex items-center justify-center rounded-full ${dimensionClasses}`} style={avatarStyle}>
                    <p className={`font-sans font-semibold text-white ${initialsClasses}`}>{ commentGetInitials() }</p>
                </div>) :
                (<div className={`flex items-center justify-center rounded-full bg-neutral-900 dark:bg-[rgba(255,255,255,0.7)] ${dimensionClasses}`}>
                    <AvatarIcon className="stroke-white dark:stroke-[rgba(0,0,0,0.6)]" />
                </div>)}
            {commentMember && <img className={`absolute top-0 left-0 rounded-full ${dimensionClasses}`} src={commentMember.avatar_image} alt="Avatar"/>}
        </>
    );

    return (
        <figure className={`relative ${dimensionClasses}`}>
            {avatarEl}
        </figure>
    );
};

export default Avatar;
