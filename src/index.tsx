// import React, { FC, HTMLAttributes, ReactChild } from 'react';

// export interface Props extends HTMLAttributes<HTMLDivElement> {
//   /** custom content, defaults to 'the snozzberries taste like snozzberries' */
//   children?: ReactChild;
// }

// // Please do not use types off of a default export module or else Storybook Docs will suffer.
// // see: https://github.com/storybookjs/storybook/issues/9556
// /**
//  * A custom Thing component. Neat!
//  */
// export const Thing: FC<Props> = ({ children }) => {
//   return <div>{children || `the snozzberries taste like snozzberries`}</div>;
// };

/**
 * Alpha Class Instance Builder
 *
 * ```ts
 * const inline = idi.class((I) => ({
 *   nice: I.public<string>("nice example string"),
 *
 *   setNice: (nice: number) => I.set({ nice }),
 *
 *   what: (what: number) => I.set({ what }),
 * }));
 * ```
 */
export const idi = (() => {
  const PUBLIC = Symbol('PUBLIC');
  const PRIVATE = Symbol('PRIVATE');
  const PROTECTED = Symbol('PROTECTED');
  const MEMBER = Symbol('MEMBER');

  type MemberT = typeof PUBLIC | typeof PRIVATE | typeof PROTECTED;

  return {
    class: (
      objMaker: (I: {
        set: (valueObj: Record<string, any>) => any;
        public: <T>(v: T) => { type: symbol; index: number };
      }) => any
    ) => {
      const preProcessRegistry: [MemberT, any][] = [];

      const ref = { current: {} as any };

      const I = {
        set: (valueObj: Record<string, any>) => {
          const [key] = Object.keys(valueObj);
          ref.current[key] = valueObj[key];
          return ref.current;
        },
        public: <T,>(v: T) => {
          const index = preProcessRegistry.length;
          preProcessRegistry.push([PUBLIC, v]);
          return { type: MEMBER, index };
        },
      };

      ref.current = objMaker(I);

      const processInitObj = (initObj: any) => {
        for (const key in initObj) {
          if (initObj.hasOwnProperty(key)) {
            const element = initObj[key];

            if (element?.type === MEMBER) {
              initObj[key] = preProcessRegistry[element.index][1];
            } else {
              initObj[key] = element;
            }
          }
        }
        return initObj;
      };

      return processInitObj(ref.current);
    },
  };
})();
