import React from "react";
import Footer from "../footer/Footer";
import {Link} from 'react-router-dom';
import Nav from '../nav/Nav';
import Sidebar from '../sidebar/Sidebar';
export default function Topic() {
    return (
        <div className="wrapper">
            <Nav/>
            <Sidebar/>
            <div className="content-wrapper">   
                <section className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1>Quản lý chủ đề</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active">Blank Page</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="content">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-12 text-right">
                                    <a className="btn btn-sm btn-danger" href="topic_trash.html">
                                        <i className="fas fa-trash"></i> Thùng rác
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <form action="#" method="post">
                                        <div className="mb-3">
                                            <label for="name">Tên chủ đề</label>
                                            <input type="text" value="" name="name" id="name" className="form-control"/>

                                        </div>
                                        <div className="mb-3">
                                            <label for="description">Mô tả</label>
                                            <textarea name="description" id="description" className="form-control"></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label for="sort_order">Sắp xếp</label>
                                            <select name="sort_order" id="sort_order" className="form-control">
                                                <option value="0">None</option>

                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label for="status">Trạng thái</label>
                                            <select name="status" id="status" className="form-control">
                                                <option value="2">Chưa xuất bản</option>
                                                <option value="1">Xuất bản</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <button type="submit" name="create" className="btn btn-success">Thêm danh
                                                mục</button>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-md-9">
                                    <table className="table table-bordered table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th className="text-center" style={{ width: '30px' }}>#</th>
                                                <th>Tên chủ đề</th>
                                                <th>Slug</th>
                                                <th className="text-center" style={{ width: '200px' }}>Chức năng</th>
                                                <th className="text-center" style={{ width: '30px' }}>ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>

                                                <td className="text-center">
                                                    <input type="checkbox" id="checkId" value="1" name="checkId[]"/>
                                                </td>
                                                <td>Ten CĐ</td>
                                                <td>Slug</td>
                                                <td className="text-center">

                                                    <a href="#" className="btn btn-sm btn-success">
                                                        <i className="fas fa-toggle-on"></i>
                                                    </a>

                                                    <a href="#" className="btn btn-sm btn-info">
                                                        <i className="far fa-eye"></i>
                                                    </a>
                                                    <a href="#" className="btn btn-sm btn-primary">
                                                        <i className="far fa-edit"></i>
                                                    </a>
                                                    <a href="#" className="btn btn-sm btn-danger">
                                                        <i className="fas fa-trash"></i>
                                                    </a>
                                                </td>
                                                <td className="text-center">
                                                    1
                                                </td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer/>
        </div>
    );
}