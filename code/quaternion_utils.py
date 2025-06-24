from scipy.spatial.transform import Rotation as R
import numpy as np

def compute_rotated_vectors_from_df(df, sample_size=300):
    if len(df) > sample_size:
        df = df.iloc[::len(df) // sample_size].copy()
    
    x_axis = np.array([1, 0, 0])
    y_axis = np.array([0, 1, 0])
    z_axis = np.array([0, 0, 1])
    
    cube_vertices = np.array([
        [-0.5, -0.5, -0.5],
        [ 0.5, -0.5, -0.5],
        [ 0.5,  0.5, -0.5],
        [-0.5,  0.5, -0.5],
        [-0.5, -0.5,  0.5],
        [ 0.5, -0.5,  0.5],
        [ 0.5,  0.5,  0.5],
        [-0.5,  0.5,  0.5]
    ])
    
    quats = R.from_quat(df[["Q1", "Q2", "Q3", "Q0"]].values)
    rotated_x = quats.apply(x_axis)
    rotated_y = quats.apply(y_axis)
    rotated_z = quats.apply(z_axis)
    rotated_cubes = [q.apply(cube_vertices) for q in quats]
    
    return {
        "timestamps": df["Timestamp"].dt.strftime('%Y-%m-%dT%H:%M:%SZ').tolist(),
        "X_prime": rotated_x.tolist(),
        "Y_prime": rotated_y.tolist(),
        "Z_prime": rotated_z.tolist(),
        "Cube": [c.tolist() for c in rotated_cubes],
        "SourceFiles": df["SourceFile"].tolist(),
        "Type": df["Type"].tolist()  
    }