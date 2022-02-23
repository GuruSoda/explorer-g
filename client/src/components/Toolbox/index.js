import React, { useState } from 'react';
import directory_back from 'assets/bx-subdirectory-left.svg'
import prettyBytes from 'pretty-bytes';
import arrow_up from 'assets/angle-up-sm.svg'
import arrow_down from 'assets/angle-down-sm.svg'

function Toolbox(prop) {

    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('')

    let total_directories = 0, total_files = 0, total_bytes = 0

    prop.listItems && Array.isArray(prop.listItems) && prop.listItems.forEach(item => {
        if (item.type === 'file') {
            total_files++
            total_bytes += item.size
        } else if (item.type === 'directory') {
            total_directories++
        }
    });

    function onFiltering (e) {
        setFilter(e.target.value)
        prop.onFilter(e.target.value)
    }

    function onFilter (e) {
        setFilter(e.target.value)
        prop.onFilter(e.target.value)
    }

    function onCancelFilter (e) {

        if (filter) {
            setFilter('')
            prop.onFilter('')
        }
    }

    function onSearch (e) {
        setSearch(e.target.value)
    }

    function onClickSearch(e) {
        prop.onSearch(search)
    }

    function onKeySearch (e) {
        if (e.code === 'Enter') {
            prop.onSearch(e.target.value)
        }
    }

    function onClickCancel () {
//        setSearch('')
        prop.onSearch('')
    }

    return (
        <>
            <div className="toolbox">
                <div className="iconBack"></div>
                    <span onClick={prop.back} src={directory_back} className="material-icons back">drive_file_move_rtl</span>
                <div className="info">
                    <div className="infoSuperior">
                        <div className="path">
                            {prop.path}
                        </div>
                        <div className="filter">
                            <label htmlFor="textoBuscar">Quick Search:</label>
                            <input type="text" id="textFilter" value={prop.filter} onChange={onFiltering}></input>
                            <span onClick={onCancelFilter} className="material-icons">cancel</span>
                        </div>
                    </div>
                    <div className="infoInferior">
                        <ul className="info_listing">
                            <li>Dirs:{total_directories}</li>
                            <li>Files:{total_files} </li>
                            <li>Size:{prettyBytes(total_bytes)}</li>
                        </ul>
                        <div className="search">
                            <label htmlFor="textSearch">Search:</label>
                            <input type="text" id="textSearch" value={search} onChange={onSearch} onKeyUp={onKeySearch}></input>
                            <span className="material-icons" onClick={onClickSearch}>search</span>
                            <span className="material-icons" onClick={onClickCancel}>cancel</span>
                        </div>
                        <ul className="order">
                            <li onClick={() => prop.clickorder('reload')}>Reload</li>
                            <li className={(prop.order.current === "date") ? "active" : ""} onClick={() => prop.clickorder('date')}>Date<div className="arrow"><img src={(prop.order.ascDate) ? arrow_up : arrow_down} alt="nada"/></div></li>
                            <li className={(prop.order.current === "name") ? "active" : ""} onClick={() => prop.clickorder('name')}>Name<div className="arrow"><img src={(prop.order.ascName) ? arrow_up : arrow_down} alt="nada"/></div></li>
                            <li className={(prop.order.current === "size") ? "active" : ""} onClick={() => prop.clickorder('size')}>Size<div className="arrow"><img src={(prop.order.ascSize) ? arrow_up : arrow_down} alt="nada"/></div></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Toolbox
