"""
Tugas Sederhana - Contoh untuk tes fitur Web Drive
Menghitung luas dan keliling persegi panjang
"""

def hitung_luas(panjang, lebar):
    return panjang * lebar

def hitung_keliling(panjang, lebar):
    return 2 * (panjang + lebar)

# Data contoh
panjang = 8
lebar = 5

luas = hitung_luas(panjang, lebar)
keliling = hitung_keliling(panjang, lebar)

print("=== Tugas Persegi Panjang ===")
print(f"Panjang : {panjang}")
print(f"Lebar   : {lebar}")
print(f"Luas    : {luas}")
print(f"Keliling: {keliling}")

print("\nPerkalian 1 sampai 5:")
for i in range(1, 6):
    print(f"{i} x {i} = {i * i}")
