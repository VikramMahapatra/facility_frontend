import { useEffect, useRef } from "react";

/**
 * Like useEffect, but skips the first render.
 */
export function useSkipFirstEffect(effect: () => void | (() => void), deps: any[]) {
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        return effect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
