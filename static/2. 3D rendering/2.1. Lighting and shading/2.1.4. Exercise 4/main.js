var vertices, vBuffer, normalsArray, vertexColors, numTimesToSubdivide;
var v0, v1, v2, v3;
var theta_y = 30;

window.onload = function init() {
    // setting up the canvas, WebGL, and the shaders
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
        alert("WebGL isn’t available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);

    // Set the light direction
    var lightDirection = vec3(0.0, 0.0, -1.0);
    var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
    gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));

    // Uniform locations for the matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    // colors
    vertexColors = [];

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // vertices
    vertices = [];
    v0 = vec4(0.0, 0.0, -1.0, 1); 
    v1 = vec4(0.0, 0.942809, 0.333333, 1);
    v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    v3 = vec4(0.816497, -0.471405, 0.333333, 1);
    numTimesToSubdivide = 0;
    
    build_polyhedron();

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    render();
};

document.getElementById("increment-subdivision-level").addEventListener("click", function() {
    if (numTimesToSubdivide > 6)
        alert("Maximum subdivision level reached!");
    else
        numTimesToSubdivide++;

    build_polyhedron();
});

document.getElementById("decrement-subdivision-level").addEventListener("click", function() {
    if (numTimesToSubdivide == 0)
        alert("subdivision level is already 0!");
    else
        numTimesToSubdivide--;

    build_polyhedron();
});

function build_polyhedron() {
    vertices = [];
    normals = [];

    tetrahedron(v0, v1, v2, v3, numTimesToSubdivide);

    // Bind the vertex buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Bind the normal buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var modelViewMatrix = mat4();
    var projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 10.0);

    theta_y += 0.1;
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, -3.0));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta_y));

    var normalMatrix = normalMatrix3x3(modelViewMatrix);

    // Pass matrices to the shader
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    requestAnimFrame(render);
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n, 0);
    divideTriangle(d, c, b, n, 1);
    divideTriangle(a, d, b, n, 2);
    divideTriangle(a, c, d, n, 3);
}

function divideTriangle(a, b, c, count) {
    if (count == 0) {
        triangle(a, b, c);
        return;
    }

    var ab = normalize(mix(a, b, 0.5), true);
    var ac = normalize(mix(a, c, 0.5), true);
    var bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
}

function triangle(a, b, c) {
    // Calculate and push vertex positions and corresponding normals (unit vectors)
    normals.push(normalize(vec3(a[0], a[1], a[2])));
    vertices.push(a);

    normals.push(normalize(vec3(b[0], b[1], b[2])));
    vertices.push(b);

    normals.push(normalize(vec3(c[0], c[1], c[2])));
    vertices.push(c);
}

function normalMatrix3x3(modelViewMatrix) {
    var upper3x3 = mat3(
        modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2],
        modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2],
        modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2]
    );
    
    var invMat = inverse(upper3x3);
    return transpose(invMat);
}