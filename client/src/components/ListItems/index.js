import React, { useState, useEffect, useRef } from 'react';
import ItemLine from 'components/ItemLine'
import Toolbox from 'components/Toolbox'
import MessageBox from 'components/MessageBox'
import FileUpload from 'components/FileUpload'
//import { getSearch } from 'services/navegadorService';
import { getList, getSearch } from 'services/fsService';
import { PathContext } from 'contexts/pathContext'
import { externalLink } from 'config/links'
import 'index.css';
import CreateDirectory from 'components/CreateDirectory';
import { useKeycloak } from "@react-keycloak/web";

function ListItems() {
  const [list, setList] = useState([]);
  const [listSearch, setListSearch] = useState(false) // si el listado es el resultado de una busqueda
  const [path, setPath] = useState('/');
  const [pathHistory, setPathHistory] = useState(['/']);
  const [reLoad, setReLoad] = useState(false);
  const [filter, setFilter] = useState('')
  const [order, setOrder] = useState({
      ascDate: true,
      ascSize: true,
      ascName: true,
      current: 'name'
    });
  const initialRender = useRef(false);
  const [state, setState] = useState('')
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    setListSearch(false)
//    console.log('useEffect por path,reload...')
    setState('Loading Directory...')
    getList(path).then(function (data) {
      if (Array.isArray(data)) {
        setList(sortDirectory(data))        
      } else if (typeof data === 'object') {
        console.log('No es un array?:', data)
        setState(data.error.code)
        setList('')
      }
    })
  }, [path, reLoad]);

  useEffect(() => {
    if (initialRender.current) {
//      console.log('useEffect por order...')
      setList(list => sortDirectory(list))
    }
  }, [order]);

  useEffect(() => {
    initialRender.current = true
  }, []);

  function onSearch (toSearch) {

      if (toSearch) {
        setState('Searching...' + toSearch)
        setList('')
        setListSearch(true)

        getSearch(path, toSearch).then(function (data) {
          setState('')
          if (Array.isArray(data)) setList(sortDirectory(data))
        })
      } else {
        if (listSearch) {
          setList('')
          setFilter('')
          setReLoad(!reLoad)        
        }
      }
  }

  function onFilter (toFilter) {
    setFilter(toFilter)
  }

  function sortDirectory(listItems) {

    if (!Array.isArray(listItems)) {
      console.log('No es un array?:', listItems)
      return []
    }

    let tmp_directory = []
    tmp_directory = listItems.filter(item => item.type === 'directory')

    tmp_directory = orderList (tmp_directory)

    let tmp_file = []
    tmp_file = listItems.filter(item => item.type === 'file')

    tmp_file = orderList (tmp_file)
    
    return tmp_directory.concat(tmp_file)
  }

  function orderList (array_items) {

    let temp = [...array_items]

    switch (order.current) {
      case 'date':
        temp.sort(compareDate)
        break;
      case 'name':
        temp.sort(compareName)
        break;
      case 'size':
        temp.sort(compareSize)
        break;
      default:
        console.log('no se hace nada')
    }

    return temp
  }

  function compareDate(aa, bb) {
    let a,b

    if (order.ascDate) { a = aa ; b = bb }  else { a = bb ; b = aa }

    if (a.modified < b.modified)
      return -1
    else if (a.modified > b.modified)
      return 1
    else
      return 0
  }

  function compareSize(a, b) {
    if (order.ascSize)
      return a.size - b.size
    else
      return b.size - a.size
  }

  function compareName(aa, bb) {

    let a,b

    if (order.ascName) { a = aa; b = bb }  else { a = bb; b = aa }
    
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  }

  function clickOrder(orderby) {

    switch (orderby) {
      case 'date':
          if (order.current === 'date') setOrder({...order, ascDate: !order.ascDate, current: 'date'})
          else setOrder({...order, current: 'date'})

          break
      case 'name':
          if (order.current === 'name') setOrder({...order, ascName: !order.ascName, current: 'name'})
          else setOrder({...order, current: 'name'})

          break
      case 'size':
          if (order.current === 'size') setOrder({...order, ascSize: !order.ascSize, current: 'size'})
          else setOrder({...order, current: 'size'})

          break
      case 'reload':
          setList('')
          setState('Reloading...')
          setReLoad(!reLoad)
          break
      default:
          console.log('no se hace nada con ', orderby)
    }
  }

  function onClickItem(info) {

    if (info.type === 'directory') {
      setFilter('')
      setList('')
      pathHistory.push(path + info.name + '/')
      setPathHistory(pathHistory)
      setPath(pathHistory.at(-1))
    } else if (info.type === 'file') {
      if (listSearch) {
        window.open((process.env.NODE_ENV === 'development' ? 'http://localhost:3001/' : window.location.href) + 'fs/view?file=' + info.name, '_blank');
      } else {
        window.open((process.env.NODE_ENV === 'development' ? 'http://localhost:3001/' : window.location.href) + 'fs/view?file=' + path + info.name, '_blank');
      }
    }
  }

  function back() {
    if (pathHistory.length > 1) {
      setFilter('')
      setList('')
      pathHistory.pop()
      setPathHistory(pathHistory)
      setPath(pathHistory.at(-1))
    }
  }

  let listFiltered = []

  if (filter) {
    let regpattern = new RegExp(filter, 'i')
    listFiltered = list.filter(item => regpattern.test(item.name))
  }

  let itemsToShow = (filter) ? listFiltered : list

  return (
    <>
      <PathContext.Provider value={path}>
        <Toolbox onSearch={onSearch} filter={filter} onFilter={onFilter} clickorder={clickOrder} back={back} path={path} listItems={itemsToShow} order={order}/>
        { keycloak.authenticated && <FileUpload directory={path}/> }
        { keycloak.authenticated && <CreateDirectory /> }
        
        { itemsToShow
        ? <ul className="listdetailed">
            { pathHistory.length > 1 && itemsToShow && !listSearch && <li onClick={back} className="item back"><span className="material-icons">drive_file_move_rtl</span>..</li>}
            { itemsToShow.map(item => <ItemLine callback={onClickItem} key={item.name} data={item} isSearch={listSearch} preview={false}/>)}
          </ul>
        : <MessageBox message={state}/>
        }
      </PathContext.Provider>
    </>
  )
}

export default ListItems
