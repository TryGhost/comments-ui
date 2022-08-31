const Count = ({showCount, count}) => {
    if (!showCount) {
        return null;
    }

    if (count === 1) {
        return (
            <div className="text-[1.6rem] text-neutral-400">1 comment</div>
        );
    }

    return (
        <div className="text-[1.6rem] text-neutral-400">{count} comments</div>
    );
};

const Title = ({title}) => {
    if (title === null) {
        return (
            <><span className="hidden sm:inline">Member </span><span className="capitalize sm:normal-case">discussion</span></>
        );
    }

    return title;
};

const ContentTitle = ({title, showCount, count}) => {
    // We have to check for null for title because null means default, wheras empty string means empty
    if (!title && !showCount && title !== null) {
        return null;
    }

    return (
        <div className="mb-10 flex w-full items-baseline justify-between font-sans">
            <h2 className="text-[2.8rem] font-bold tracking-tight dark:text-[rgba(255,255,255,0.85)]">
                <Title title={title}/>
            </h2>
            <Count count={count} showCount={showCount} />
        </div>
    );
};

export default ContentTitle;
