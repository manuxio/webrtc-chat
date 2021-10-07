import React, {
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useImperativeHandle,
  useState,
  useRef
} from "react";

import useScroll from "../libs/useScroll";
import ScrollBars from 'react-custom-scrollbars-2';

interface Props {
  children: ReactNode;
  initialReverse?: boolean;
  loadingComponent: ReactNode;

  nextDataFn: () => void;
  nextEnd: boolean;
  nextLoading: boolean;
  previousDataFn: () => void;
  previousEnd: boolean;
  previousLoading: boolean;
}

const BxInfiniteScroll = forwardRef<ReactNode, Props>(
  (
    {
      children,
      initialReverse = true,
      loadingComponent,

      nextDataFn,
      nextEnd,
      nextLoading,
      previousDataFn,
      previousEnd,
      previousLoading,
    }: Props,
    ref,
  ) => {
    useImperativeHandle(ref, () => {
      return {
        setReverseCol,
      };
    });

    const [reverseCol, setReverseCol] = useState(initialReverse);
    const [reverseColValue, setReverseColValue] = useState<number | null>(null);
    const myScroller = useRef(null);
    const [scrolledToBottom, scrolledToTop, containerRef] =
      useScroll(reverseCol);
    const [isOnTop, setIsOnTop] = useState(false);
    const [isOnBottom, setIsOnBottom] = useState(false);
    const container = (myScroller as RefObject<HTMLDivElement>).current;

    // This is called next render - next flex-col or flex-col-reverse is set
    useEffect(() => {
      if (reverseColValue !== null) {
        console.log('************ SCROLLING CONTAINER TO *************', reverseColValue);
        container?.scrollTop(reverseColValue);
      }
    }, [reverseColValue]);

    useEffect(() => {
      if (!container) return;
      console.log('Here...scrolledToTop', isOnTop, previousLoading, previousEnd, nextLoading);
      if (isOnTop && !previousLoading && !previousEnd && !nextLoading) {
        // if (!reverseCol) {
          const scrollTo =
            myScroller.current.getScrollTop() -
            myScroller.current.getScrollHeight() -
            myScroller.current.getClientHeight();
          if (!reverseCol) {
            // setReverseColValue(scrollTo);
          }
          setReverseCol(true);
          console.log('SCROLL TOP (not reverse): set reverseColValue as ', scrollTo);
        // }

        previousDataFn();
      }
    }, [isOnTop, reverseCol]);

    useEffect(() => {
      if (!container) return;
      console.log('Here2...scrolledToBottom', isOnBottom, nextLoading, nextEnd, previousLoading);
      if (isOnBottom && !nextLoading && !nextEnd && !previousLoading) {
        // if (reverseCol) {
          const scrollTo =
            myScroller.current.getScrollTop() +
            myScroller.current.getScrollHeight() -
            myScroller.current.getClientHeight();
          setReverseCol(false);
          // setReverseColValue(scrollTo);
          console.log('SCROLL BOTTOM (reverse): set reverseColValue as ', scrollTo);
        // }

        nextDataFn();
      }
    }, [isOnBottom, reverseCol]);

    return (
      <ScrollBars
        ref={myScroller}
        // autoHide
        // Hide delay in ms
        // autoHideTimeout={1000}
        // Duration for hide animation in ms.
        // autoHideDuration={200}
        style={{
          flex: '1 1 auto',
          display: "flex",
        }}
        renderView = {({ style, ...props }) => {
          const customStyle = {
            display: "flex",
            flexDirection: reverseCol ? "column-reverse" : "column",
            // overflowAnchor: "none",
            // flexDirection: "column-reverse",
            // justifyContent: 'revert'
          };
          return (
              <div {...props} style={{ ...style, ...customStyle }}/>
          );
        }}
        onScrollStop={() => {
          console.log('Scroll stop', reverseCol, myScroller.current.getValues());
          // console.log('Fully down?', this.scrollBars.getValues().top )
          // const { isFullScrolled: oldIsFullyScrolled } = this.state;
          if (!reverseCol) {

            const isFullScrolled =
              myScroller.current.getValues().top >= 0.98 ||
              myScroller.current.getValues().scrollHeight ===
              myScroller.current.getValues().clientHeight;
            const isTopScrolled = myScroller.current.getValues().top <= 0.02;
            // console.log('END OF SCROLL', myScroller.current.getValues());

            // console.log('END OF SCROLL: BOTTOM?', isFullScrolled);
            // console.log('END OF SCROLL: TOP?', isTopScrolled);
            setIsOnTop(isTopScrolled);
            setIsOnBottom(isFullScrolled);
          } else {
            const isFullScrolled =
              myScroller.current.getValues().top > -0.02 ||
              myScroller.current.getValues().scrollHeight ===
              myScroller.current.getValues().clientHeight;
            const isTopScrolled = myScroller.current.getValues().top < -0.98;
            // console.log('END OF SCROLL', myScroller.current.getValues());

            // console.log('END OF SCROLL: BOTTOM?', isFullScrolled);
            // console.log('END OF SCROLL: TOP?', isTopScrolled);
            setIsOnTop(isTopScrolled);
            setIsOnBottom(isFullScrolled);
          }
          // // console.log('Scroll Values', this.scrollBars.getValues());
          // if (oldIsFullyScrolled != isFullScrolled) {
          //   this.setState({
          //     isFullScrolled,
          //   });
          // }
        }}
      >
        <div style={{ }}>
          {previousLoading && loadingComponent}
          <div style={{ overflowAnchor: "auto" }} />
          {children}
          <div style={{ overflowAnchor: "auto" }} />
          {nextLoading && loadingComponent}
        </div>
      </ScrollBars>
    );
  },
);

BxInfiniteScroll.displayName = "BxInfiniteScroll";

export default BxInfiniteScroll;
