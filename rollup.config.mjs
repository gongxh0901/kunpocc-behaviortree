import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
    {
        // 生成未压缩的 JS 文件
        input: 'src/index.ts',
        external: ['cc', 'fairygui-cc'],
        output: [
            {
                file: 'dist/kunpocc-behaviortree.mjs',
                format: 'esm',
                name: 'kunpocc-behaviortree'
            },
            {
                file: 'dist/kunpocc-behaviortree.cjs',
                format: 'cjs',
                name: 'kunpocc-behaviortree'
            }
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                importHelpers: false,
                compilerOptions: {
                    target: "es6",
                    module: "es6",
                    experimentalDecorators: true, // 启用ES装饰器
                    strict: true,
                    strictNullChecks: true,
                    moduleResolution: "Node",
                    skipLibCheck: true,
                    esModuleInterop: true,
                }
            })
        ]
    },
    {
        // 生成压缩的 JS 文件
        input: 'src/index.ts',
        external: ['cc', 'fairygui-cc'],
        output: [
            {
                file: 'dist/kunpocc-behaviortree.min.mjs',
                format: 'esm',
                name: 'kunpocc-behaviortree'
            },
            {
                file: 'dist/kunpocc-behaviortree.min.cjs',
                format: 'cjs',
                name: 'kunpocc-behaviortree'
            }
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                importHelpers: false,
                compilerOptions: {
                    target: "es6",
                    module: "es6",
                    experimentalDecorators: true, // 启用ES装饰器
                    strict: true,
                    strictNullChecks: true,
                    moduleResolution: "Node",
                    skipLibCheck: true,
                    esModuleInterop: true,
                }
            }),
            terser()
        ]
    },
    {
        // 生成声明文件的配置
        input: 'src/index.ts',
        output: {
            file: 'dist/kunpocc-behaviortree.d.ts',
            format: 'es'
        },
        plugins: [dts({
            compilerOptions: {
                stripInternal: true
            }
        })]
    }
]; 