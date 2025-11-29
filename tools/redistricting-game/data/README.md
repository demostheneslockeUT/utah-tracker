# Redistricting Game Data

## Required Downloads (from Redistricting Data Hub)

1. **VEST 2020 Precinct + Election Results**
   - URL: https://redistrictingdatahub.org/dataset/vest-2020-utah-precinct-boundaries-and-election-results-shapefile/
   - Save to: `raw/ut_vest_20.zip`

2. **2021 Adopted Congressional Plan**
   - URL: https://redistrictingdatahub.org/dataset/2021-utah-cong-adopted-plan/
   - Save to: `raw/ut_cong_2021.zip`

3. **2025 Congressional Districts Approved Plan**
   - URL: https://redistrictingdatahub.org/dataset/2025-utah-congressional-districts-approved-plan/
   - Save to: `raw/ut_cong_2025.zip`

## Processing Pipeline

After downloading, run:
```
python3 process_geodata.py
```

This will:
1. Extract shapefiles
2. Filter to Salt Lake County precincts
3. Simplify geometries for web
4. Export as GeoJSON
