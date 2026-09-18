# MPF install research

Current MPF documentation confirms the standard custom-mode path is `modes/<mode_name>/config/<mode_name>.yaml`, and modes that should be loaded must be listed in the machine-wide `modes:` section. PinBlocks v0.20 implements that installation structure. The YAML compiler itself is intentionally unchanged in this release and remains the next audit target.
