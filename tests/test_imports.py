from systemAccess import api, auth, core, dependencies, models, schemas


def test_internal_imports() -> None:
    assert api is not None
    assert auth is not None
    assert core is not None
    assert dependencies is not None
    assert models is not None
    assert schemas is not None
