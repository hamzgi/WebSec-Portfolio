"""Create the editable, rigged whale and its web-ready GLB with Blender 5.3.

Run from the repository root:
  blender --background --python scripts/create_whale.py
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets" / "whale"
PUBLIC = ROOT / "public" / "models"
ASSETS.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)

def material(name, color, roughness=0.3, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat

blue = material("Soft blue", (0.11, 0.34, 0.80), .72)
body_color = material("Matte whale skin", (1, 1, 1), .7)
eye = material("Deep navy eyes", (0.009, 0.016, 0.035), .27)
shine = material("Eye sparkle", (1, 1, 1), .2)
smile_mat = material("Smile", (.016, .055, .14), .35)
groove_mat = material("Belly grooves", (.74, .65, .67), .72)

# X is the whale's length, Y its width, Z its height; the face is on the -Y side.
rings = [
    (-2.35, .055, .075, .35), (-2.22, .16, .18, .30),
    (-2.05, .27, .28, .20), (-1.82, .40, .39, .09),
    (-1.55, .60, .56, -.02), (-1.25, .84, .76, -.02),
    (-.90, 1.04, .97, 0), (-.48, 1.20, 1.13, 0),
    (0, 1.29, 1.24, .02), (.48, 1.26, 1.25, .04),
    (.90, 1.10, 1.12, .05), (1.23, .78, .87, .07),
    (1.45, .35, .47, .10), (1.50, .01, .02, .10),
]
N = 64
vertices, faces = [], []
for x, ry, rz, cz in rings:
    for j in range(N):
        a = 2 * math.pi * j / N
        vertices.append((x, math.cos(a) * ry, cz + math.sin(a) * rz))
for i in range(len(rings) - 1):
    for j in range(N):
        faces.append((i*N+j, i*N+(j+1)%N, (i+1)*N+(j+1)%N, (i+1)*N+j))
mesh = bpy.data.meshes.new("Whale continuous body")
mesh.from_pydata(vertices, [], faces)
mesh.materials.append(body_color)
mesh.update()
nodes = body_color.node_tree.nodes
vcol = nodes.new("ShaderNodeVertexColor")
vcol.layer_name = "WhaleColors"
body_color.node_tree.links.new(vcol.outputs["Color"], nodes.get("Principled BSDF").inputs["Base Color"])
body = bpy.data.objects.new("Whale body", mesh)
bpy.context.collection.objects.link(body)
for polygon in mesh.polygons:
    polygon.use_smooth = True
sub = body.modifiers.new("Smooth silhouette", "SUBSURF")
sub.levels = 2
sub.render_levels = 2
bpy.context.view_layer.objects.active = body
body.select_set(True)
bpy.ops.object.modifier_apply(modifier=sub.name)
body.select_set(False)
# Color the already-smoothed surface, so the transition follows a level curve
# without the visible ripples caused by interpolating the coarse control cage.
mesh = body.data
colors = mesh.color_attributes.new(name="WhaleColors", type="FLOAT_COLOR", domain="CORNER")
blue_color = Vector((.11, .34, .80))
belly_color = Vector((.98, .94, .91))
for polygon in mesh.polygons:
    for loop_index in polygon.loop_indices:
        z = mesh.vertices[mesh.loops[loop_index].vertex_index].co.z
        mix = max(0, min(1, (-.57-z) / .07))
        mix = mix * mix * (3 - 2 * mix)
        color = blue_color.lerp(belly_color, mix)
        colors.data[loop_index].color = (*color, 1)

def sphere(name, location, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj

def leaf(name, points, thickness, mat):
    # Rounded flattened shape with subdivision; outline is authored in 3D.
    center = sum((Vector(p) for p in points), Vector()) / len(points)
    verts = [tuple(center + Vector((0, -thickness, 0))), tuple(center + Vector((0, thickness, 0)))] + points
    fs = []
    for i in range(len(points)):
        nxt = 2 + (i + 1) % len(points)
        fs.extend([(0, 2+i, nxt), (1, nxt, 2+i)])
    m = bpy.data.meshes.new(name)
    m.from_pydata(verts, [], fs)
    m.materials.append(mat)
    m.update()
    obj = bpy.data.objects.new(name, m)
    bpy.context.collection.objects.link(obj)
    for p in m.polygons:
        p.use_smooth = True
    mod = obj.modifiers.new("Rounded edges", "SUBSURF")
    mod.levels = 2
    mod.render_levels = 2
    return obj

tail = leaf("Tail flukes", [(-2.24, 0, -.12), (-2.58, -.10, .46), (-2.85, -.16, .94), (-2.80, -.16, 1.12), (-2.62, -.12, 1.18), (-2.40, -.04, .95), (-2.27, 0, .83), (-2.12, .04, 1.00), (-1.95, .12, 1.18), (-1.77, .16, 1.12), (-1.74, .16, .94), (-1.94, .10, .46)], .12, blue)

def flipper(name, side):
    # Paired tapered, rounded flippers extend along the width of the whale.
    # Their inner ends sit inside the body, keeping the joints hidden as they move.
    sections = [
        (.90, .0, .06, .05), (1.08, .0, .28, .18),
        (1.28, .01, .31, .19), (1.49, .05, .29, .17),
        (1.67, .10, .24, .14), (1.80, .15, .15, .09),
        (1.86, .17, .015, .012),
    ]
    segments = 24
    verts, faces = [], []
    for distance, lift, depth, height in sections:
        for j in range(segments):
            angle = 2 * math.pi * j / segments
            verts.append((.05 + math.cos(angle) * depth, side * distance, -.38 + lift + math.sin(angle) * height))
    for i in range(len(sections) - 1):
        for j in range(segments):
            a, b = i * segments + j, i * segments + (j + 1) % segments
            c, d = (i + 1) * segments + (j + 1) % segments, (i + 1) * segments + j
            faces.append((a, b, c, d) if side > 0 else (d, c, b, a))
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.materials.append(blue)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    for poly in data.polygons:
        poly.use_smooth = True
    smooth = obj.modifiers.new("Smooth flipper", "SUBSURF")
    smooth.levels = 2
    smooth.render_levels = 2
    return obj

fin_front = flipper("Left flipper", -1)
fin_back = flipper("Right flipper", 1)

def curve(name, points, thickness, mat):
    c = bpy.data.curves.new(name, "CURVE")
    c.dimensions = "3D"
    c.resolution_u = 24
    c.bevel_depth = thickness
    c.bevel_resolution = 3
    sp = c.splines.new("BEZIER")
    sp.bezier_points.add(len(points)-1)
    for bp, point in zip(sp.bezier_points, points):
        bp.co = point
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat)
    return ob

# Put the facial features on the rounded nose (+X), not the side of the body.
bpy.context.view_layer.update()
body_surface = BVHTree.FromObject(body, bpy.context.evaluated_depsgraph_get())
def nose_surface(y, z):
    hit, normal, _, _ = body_surface.ray_cast(Vector((3, y, z)), Vector((-1, 0, 0)))
    if hit is None:
        raise ValueError(f"No nose surface at {y}, {z}")
    return hit, normal

def surface_oval(name, y, z, size, mat, offset=.014):
    point, normal = nose_surface(y, z)
    obj = sphere(name, point + normal * offset, size, mat)
    obj.rotation_euler = normal.to_track_quat("Z", "Y").to_euler()
    return obj

# A transparent radial texture makes the blush part of the surface rather than
# two separate pink protrusions. It is packed into the exported GLB.
image = bpy.data.images.new("Soft blush", width=64, height=64, alpha=True)
pixels = []
for row in range(64):
    for col in range(64):
        d = math.sqrt(((col-31.5)/31.5)**2 + ((row-31.5)/31.5)**2)
        a = max(0.0, 1.0 - d)
        pixels.extend((1.0, .56, .68, a*a*.7))
image.pixels = pixels
image.pack()
blush = bpy.data.materials.new("Soft blush")
blush.diffuse_color = (1, .38, .52, .5)
blush.use_nodes = True
blush.surface_render_method = "DITHERED"
bsdf = blush.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Roughness"].default_value = .8
tex = blush.node_tree.nodes.new("ShaderNodeTexImage")
tex.image = image
blush.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
blush.node_tree.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])

def blush_patch(y):
    point, normal = nose_surface(y, -.18)
    bpy.ops.mesh.primitive_plane_add(size=1, location=point + normal * .014)
    obj = bpy.context.object
    obj.name = "Soft blush"
    obj.rotation_euler = normal.to_track_quat("Z", "Y").to_euler()
    obj.scale = (.46, .32, 1)
    obj.data.materials.append(blush)
    return obj

details = []
for y in [-.46, .46]:
    details.append(surface_oval("Eye", y, .10, (.085,.15,.035), eye))
    details.append(surface_oval("Eye highlight", y-.025, .16, (.022,.035,.012), shine, .051))
for y in [-.75, .75]:
    details.append(blush_patch(y))
details.append(curve("Happy smile", [nose_surface(y,z)[0] + nose_surface(y,z)[1]*.025 for y,z in [(-.24,-.26), (0,-.32), (.24,-.26)]], .012, smile_mat))

# Surface-following stripes on the lower front, on the ivory side of the body.
for y in [-.65, -.35, 0, .35, .65]:
    points = []
    for z in [-.64, -.75, -.86, -.97, -1.07]:
        hit, normal, _, _ = body_surface.ray_cast(Vector((3, y, z)), Vector((-1, 0, 0)))
        if hit is not None:
            points.append(hit + normal * .009)
    if len(points) >= 2:
        details.append(curve("Belly groove", points, .005, groove_mat))

# A real deforming skeleton and named vertex groups export as a glTF skin.
arm_data = bpy.data.armatures.new("Whale skeleton")
rig = bpy.data.objects.new("Whale rig", arm_data)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
root = arm_data.edit_bones.new("Body")
root.head, root.tail = (0, 0, 0), (-.8, 0, 0)
tail_bone = arm_data.edit_bones.new("Tail")
tail_bone.head, tail_bone.tail = (-1.35, 0, 0), (-2.30, 0, .3)
tail_bone.parent = root
for name, head, end in [("Fin.L", (.05,-1.05,-.38), (.05,-1.65,-.28)), ("Fin.R", (.05,1.05,-.38), (.05,1.65,-.28))]:
    bone = arm_data.edit_bones.new(name)
    bone.head, bone.tail, bone.parent = head, end, root
bpy.ops.object.mode_set(mode="OBJECT")

def bind(obj, weights):
    for name, values in weights.items():
        group = obj.vertex_groups.new(name=name)
        for index, weight in enumerate(values):
            if weight > .0001:
                group.add([index], weight, "REPLACE")
    mod = obj.modifiers.new("Whale rig", "ARMATURE")
    mod.object = rig
    obj.parent = rig

tail_weights = [max(0, min(1, (-v.co.x - 1.0) / 1.15)) for v in body.data.vertices]
bind(body, {"Body": [1-w for w in tail_weights], "Tail": tail_weights})
bind(tail, {"Tail": [1]*len(tail.data.vertices)})
bind(fin_front, {"Fin.L": [1]*len(fin_front.data.vertices)})
bind(fin_back, {"Fin.R": [1]*len(fin_back.data.vertices)})
for obj in details:
    obj.parent = rig

for frame, angle in [(1,0), (21,.13), (41,0), (61,-.13), (81,0)]:
    for name, factor in [("Tail",1), ("Fin.L",.75), ("Fin.R",-.75)]:
        pb = rig.pose.bones[name]
        pb.rotation_mode = "XYZ"
        pb.rotation_euler[1] = angle * factor
        pb.keyframe_insert(data_path="rotation_euler", frame=frame, group=name)
rig.animation_data.action.name = "Gentle swim"
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 81
bpy.context.scene.frame_set(1)

# Only the model is selected for export; the editable source also has a preview setup.
bpy.ops.object.select_all(action="DESELECT")
for obj in [rig, body, tail, fin_front, fin_back, *details]:
    obj.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(filepath=str(PUBLIC / "whale.glb"), export_format="GLB", use_selection=True, export_animations=True, export_frame_range=True, export_apply=True)

world = bpy.context.scene.world or bpy.data.worlds.new("World")
bpy.context.scene.world = world
world.color = (.8,.8,.8)
def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()
bpy.ops.object.camera_add(location=(7.5,-8.5,3.0))
camera = bpy.context.object
camera.data.type = "ORTHO"
camera.data.ortho_scale = 5.8
point_at(camera, (-.45,0,.05))
bpy.context.scene.camera = camera
for location, power, size in [((0,-5,7), 700, 5), ((-4,-2,3), 450, 4), ((3,3,4), 650, 3)]:
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.data.energy, light.data.shape, light.data.size = power, "DISK", size
    point_at(light, (0,0,0))
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 32
scene.render.resolution_x = 1000
scene.render.resolution_y = 700
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = True
bpy.ops.wm.save_as_mainfile(filepath=str(ASSETS / "whale.blend"))
scene.render.filepath = str(ASSETS / "preview.png")
bpy.ops.render.render(write_still=True)
