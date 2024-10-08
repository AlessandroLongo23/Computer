<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let view_index = 1;
    let loading = true;
    let canvas, gl, program;
    let code_snippets = [];

    let vertices, indices;
    let model_view_matrix_loc;
    let projection_matrix_loc;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
            gl.enable(gl.DEPTH_TEST);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                // vertices
                vertices = [
                    mv.vec3(-0.5, -0.5, 0.5),
                    mv.vec3(-0.5, 0.5, 0.5),
                    mv.vec3(0.5, 0.5, 0.5),
                    mv.vec3(0.5, -0.5, 0.5),
                    mv.vec3(-0.5, -0.5, -0.5),
                    mv.vec3(-0.5, 0.5, -0.5),
                    mv.vec3(0.5, 0.5, -0.5),
                    mv.vec3(0.5, -0.5, -0.5)
                ];

                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);

                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                // colors
                var vertexColors = [
                    [0.0, 0.0, 0.0, 1.0],  // black
                    [1.0, 0.0, 0.0, 1.0],  // red
                    [1.0, 1.0, 0.0, 1.0],  // yellow
                    [0.0, 1.0, 0.0, 1.0],  // green
                    [0.0, 0.0, 1.0, 1.0],  // blue
                    [1.0, 0.0, 1.0, 1.0],  // magenta
                    [1.0, 1.0, 1.0, 1.0],  // white
                    [0.0, 1.0, 1.0, 1.0]   // cyan
                ];

                var cBuffer = gl.createBuffer();  // Buffer for colors
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertexColors), gl.STATIC_DRAW);

                var vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);  // 4 components for RGBA
                gl.enableVertexAttribArray(vColor);

                // indices
                indices = [
                    1, 0, 3,
                    3, 2, 1,
                    2, 3, 7,
                    7, 6, 2,
                    3, 0, 4,
                    4, 7, 3,
                    6, 5, 1,
                    1, 2, 6,
                    4, 5, 6,
                    6, 7, 4,
                    5, 4, 0,
                    0, 1, 5
                ];

                var iBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

                // Initialize rotation and transformations
                model_view_matrix_loc = gl.getUniformLocation(program, "modelViewMatrix");
                projection_matrix_loc = gl.getUniformLocation(program, "projectionMatrix");

                render();
            } catch (error) {
                console.error(error);
            }

            code_snippets = await fetchCodeSnippets($page.url.pathname);
            loading = false;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Cube 1 - One-point perspective (front view)
        var ctm = mv.mat4();
        var projectionMatrix = mv.perspective(45, canvas.width / canvas.height, .001, 10.0);
        gl.uniformMatrix4fv(projection_matrix_loc, false, mv.flatten(projectionMatrix));

        ctm = mv.mult(ctm, mv.translate(-1.5, 0, -3));  // Move to the left
        gl.uniformMatrix4fv(model_view_matrix_loc, false, mv.flatten(ctm));
        gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

        // Cube 2 - Two-point perspective (X-axis rotated)
        ctm = mv.mat4();
        ctm = mv.mult(ctm, mv.translate(0, 0, -3));  // Centered
        ctm = mv.mult(ctm, mv.rotateY(30));  // Rotate around Y-axis
        gl.uniformMatrix4fv(model_view_matrix_loc, false, mv.flatten(ctm));
        gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

        // Cube 3 - Three-point perspective (X, Y, and Z rotated)
        ctm = mv.mat4();
        ctm = mv.mult(ctm, mv.translate(1.5, 0, -3));
        ctm = mv.mult(ctm, mv.rotateX(20));
        ctm = mv.mult(ctm, mv.rotateY(30));
        ctm = mv.mult(ctm, mv.rotateZ(20));
        gl.uniformMatrix4fv(model_view_matrix_loc, false, mv.flatten(ctm));
        gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

        requestAnimFrame(render);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-3/5 m-auto">
        <p class="text-black text-bold text-xl">Draw the unit cube in different classical perspective views.</p>  
        <ul>
            <li>Introduce a projection matrix that sets the camera to be a pinhole camera with a 45 degrees vertical field of view. [Angel 1.4.1, 5.5-5.7] </li>
            <li>Draw the cube three times in the same rendering. Transform the cubes so that one is in one-point (front) perspective, one is in two-point (X) perspective, and one is in three-point perspective. [Angel 4.9-4.11, 5.1.5]</li>
        </ul>
    </div>

    <Result bind:canvas={canvas} bind:view_index={view_index} loading={loading} code_snippets={code_snippets} width={1024}/>
</div>